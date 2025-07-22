const prisma = require("../config/prisma");

// ເພີ່ມລົດເຂົ້າກະຕ່າ (ຈອງ)
exports.addToCart = async (req, res) => {
  try {
    const {
      customerId,
      items // [{ saleCarId, quantity, price }]
    } = req.body;

    const userId = req.user.id;

    console.log("🛒 Adding items to cart:", { customerId, items, userId });

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນ"
      });
    }

    // ກວດສອບວ່າລູກຄ້າມີຢູ່ຈິງຫຼືບໍ່
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId) }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບຂໍ້ມູນລູກຄ້າ"
      });
    }

    // ກວດສອບວ່າລົດທີ່ຈະຈອງວ່າງຢູ່ຫຼືບໍ່
    const saleCarIds = items.map(item => parseInt(item.saleCarId));
    const availableCars = await prisma.saleCar.findMany({
      where: {
        id: { in: saleCarIds },
        status: "Available"
      },
      include: {
        car: {
          include: {
            brandCars: true,
            brandAndModels: true,
            typecar: true
          }
        }
      }
    });

    console.log("🔍 Available cars found:", availableCars.length);

    if (availableCars.length !== saleCarIds.length) {
      return res.status(400).json({
        success: false,
        message: "ມີລົດບາງຄັນບໍ່ສາມາດຈອງໄດ້ຫຼືຖືກຈອງໄປແລ້ວ"
      });
    }

    // ຄິດໄລ່ລາຄາລວມ
    const totalAmount = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
    }, 0);

    // ສ້າງ transaction ເພື່ອຮັບປະກັນຄວາມຖືກຕ້ອງ
    const result = await prisma.$transaction(async (prisma) => {
      // ສ້າງ Cart
      const cart = await prisma.cart.create({
        data: {
          orderdById: userId,
          customerId: parseInt(customerId),
          totalAmount: totalAmount
        }
      });

      console.log("🛒 Cart created:", cart.id);

      // ເພີ່ມ items ເຂົ້າ cart ແລະປ່ຽນສະຖານະລົດເປັນ Reserved
      const cartItems = [];
      for (const item of items) {
        const cartItem = await prisma.itemOnCart.create({
          data: {
            cartId: cart.id,
            orderId: cart.id, // ຕາມ schema ທີ່ມີ
            saleCarId: parseInt(item.saleCarId),
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
          }
        });
        cartItems.push(cartItem);

        // ປ່ຽນສະຖານະລົດເປັນ "Reserved" (ຈອງ)
        await prisma.saleCar.update({
          where: { id: parseInt(item.saleCarId) },
          data: { 
            status: "Reserved"
          }
        });

        console.log(`🔒 Sale car ${item.saleCarId} marked as reserved`);
      }

      return { cart, cartItems };
    });

    // ດຶງຂໍ້ມູນ Cart ພ້ອມລາຍລະອຽດ
    const cartWithDetails = await prisma.cart.findUnique({
      where: { id: result.cart.id },
      include: {
        customer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            number: true,
            email: true
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        ItemOnCart: {
          include: {
            saleCar: {
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true,
                    brandAndModels: true,
                    images: true
                  }
                },
                colorCar: true
              }
            }
          }
        }
      }
    });

    console.log("🎉 Cart created successfully:", cartWithDetails.id);

    res.status(201).json({
      success: true,
      message: `ຈອງລົດສຳເລັດແລ້ວ #${cartWithDetails.id}`,
      data: cartWithDetails
    });

  } catch (err) {
    console.error("❌ Error adding to cart:", err);
    
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "ມີຂໍ້ມູນຊ້ຳກັນໃນລະບົບ"
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ: " + err.message
    });
  }
};

// ດຶງລາຍການ Cart ທັງໝົດ
exports.listCarts = async (req, res) => {
  try {
    const { page = 1, limit = 10, customerId, startDate, endDate } = req.query;
    
    const where = {};
    
    if (customerId) {
      where.customerId = parseInt(customerId);
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const carts = await prisma.cart.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: {
        customer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            number: true,
            email: true
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        ItemOnCart: {
          include: {
            saleCar: {
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true,
                    brandAndModels: true,
                    images: { take: 1 }
                  }
                },
                colorCar: true
              }
            }
          }
        }
      }
    });

    const totalCarts = await prisma.cart.count({ where });
    const totalPages = Math.ceil(totalCarts / parseInt(limit));

    res.json({
      success: true,
      data: carts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCarts,
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error("Error listing carts:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ດຶງລາຍລະອຽດ Cart ແຕ່ລະອັນ
exports.getCartById = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await prisma.cart.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        ItemOnCart: {
          include: {
            saleCar: {
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true,
                    brandAndModels: true,
                    images: true
                  }
                },
                colorCar: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບກະຕ່າທີ່ລະບຸ"
      });
    }

    res.json({
      success: true,
      data: cart
    });

  } catch (err) {
    console.error("Error getting cart:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ແປງ Cart ເປັນ Order (ຢືນຢັນການຂາຍ)
exports.convertCartToOrder = async (req, res) => {
  try {
    const { cartId } = req.params;
    const userId = req.user.id;

    console.log("🔄 Converting cart to order:", { cartId, userId });

    // ດຶງຂໍ້ມູນ Cart ພ້ອມ items
    const cart = await prisma.cart.findUnique({
      where: { id: parseInt(cartId) },
      include: {
        customer: true,
        ItemOnCart: {
          include: {
            saleCar: true
          }
        }
      }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບກະຕ່າທີ່ລະບຸ"
      });
    }

    // ກວດສອບວ່າລົດຍັງຖືກຈອງຢູ່ຫຼືບໍ່
    for (const item of cart.ItemOnCart) {
      if (item.saleCar.status !== "Reserved") {
        return res.status(400).json({
          success: false,
          message: `ລົດ ${item.saleCar.name || item.saleCar.id} ບໍ່ໄດ້ຖືກຊອງໄວ້ ບໍ່ສາມາດສ້າງອໍເດີໄດ້`
        });
      }
    }

    // ສ້າງ transaction ເພື່ອແປງ cart ເປັນ order
    const result = await prisma.$transaction(async (prisma) => {
      // ສ້າງ Order ໃໝ່
      const order = await prisma.order.create({
        data: {
          orderdById: userId,
          customerId: cart.customerId,
          totalAmount: cart.totalAmount
        }
      });

      console.log("📋 Order created from cart:", order.id);

      // ສ້າງ ItemOnOrder ແລະອັບເດດສະຖານະລົດ
      const orderItems = [];
      for (const cartItem of cart.ItemOnCart) {
        // ສ້າງ ItemOnOrder
        const orderItem = await prisma.itemOnOrder.create({
          data: {
            orderId: order.id,
            saleCarId: cartItem.saleCarId,
            quantity: cartItem.quantity,
            price: cartItem.price
          }
        });
        orderItems.push(orderItem);

        // ປ່ຽນສະຖານະລົດເປັນ "Sold"
        await prisma.saleCar.update({
          where: { id: cartItem.saleCarId },
          data: { 
            status: "Sold",
            soldDate: new Date()
          }
        });

        console.log(`✅ Sale car ${cartItem.saleCarId} marked as sold`);
      }

      // ລົບ ItemOnCart
      await prisma.itemOnCart.deleteMany({
        where: { cartId: parseInt(cartId) }
      });

      // ລົບ Cart
      await prisma.cart.delete({
        where: { id: parseInt(cartId) }
      });

      console.log("🗑️ Cart deleted:", cartId);

      return { order, orderItems };
    });

    // ດຶງຂໍ້ມູນ Order ທີ່ສ້າງໃໝ່ພ້ອມລາຍລະອຽດ
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: result.order.id },
      include: {
        customer: {
          select: {
            id: true,
            fname: true,
            lname: true,
            number: true,
            email: true
          }
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        ItemOnOrder: {
          include: {
            saleCar: {
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true,
                    brandAndModels: true,
                    images: true
                  }
                },
                colorCar: true
              }
            }
          }
        }
      }
    });

    console.log("🎉 Cart converted to order successfully:", orderWithDetails.id);

    res.status(201).json({
      success: true,
      message: `ຢືນຢັນການຂາຍສຳເລັດແລ້ວ - ອໍເດີເລກທີ່ #${orderWithDetails.id}`,
      data: orderWithDetails
    });

  } catch (err) {
    console.error("❌ Error converting cart to order:", err);
    
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການສ້າງອໍເດີ: " + err.message
    });
  }
};

// ຍົກເລີກ Cart (ຄືນສະຖານະລົດເປັນ Available)
exports.cancelCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    console.log("❌ Canceling cart:", cartId);

    const cart = await prisma.cart.findUnique({
      where: { id: parseInt(cartId) },
      include: {
        ItemOnCart: {
          include: {
            saleCar: true
          }
        }
      }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບກະຕ່າທີ່ລະບຸ"
      });
    }

    // ສ້າງ transaction ເພື່ອຍົກເລີກ cart
    await prisma.$transaction(async (prisma) => {
      // ຄືນສະຖານະລົດເປັນ Available
      for (const item of cart.ItemOnCart) {
        await prisma.saleCar.update({
          where: { id: item.saleCarId },
          data: { 
            status: "Available"
          }
        });

        console.log(`🔓 Sale car ${item.saleCarId} marked as available`);
      }

      // ລົບ ItemOnCart
      await prisma.itemOnCart.deleteMany({
        where: { cartId: parseInt(cartId) }
      });

      // ລົບ Cart
      await prisma.cart.delete({
        where: { id: parseInt(cartId) }
      });
    });

    res.json({
      success: true,
      message: "ຍົກເລີກການຈອງສຳເລັດແລ້ວ"
    });

  } catch (err) {
    console.error("Error canceling cart:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການຍົກເລີກ"
    });
  }
};

// ແກ້ໄຂ Cart (ເພີ່ມ/ລົບ items)
exports.updateCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { action, saleCarId, quantity, price } = req.body; // action: "add" หรือ "remove"

    console.log("✏️ Updating cart:", { cartId, action, saleCarId });

    const cart = await prisma.cart.findUnique({
      where: { id: parseInt(cartId) },
      include: {
        ItemOnCart: true
      }
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບກະຕ່າທີ່ລະບຸ"
      });
    }

    if (action === "add") {
      // ກວດສອບວ່າລົດວ່າງຢູ່ຫຼືບໍ່
      const saleCar = await prisma.saleCar.findUnique({
        where: { id: parseInt(saleCarId) }
      });

      if (!saleCar || saleCar.status !== "Available") {
        return res.status(400).json({
          success: false,
          message: "ລົດບໍ່ສາມາດຈອງໄດ້"
        });
      }

      await prisma.$transaction(async (prisma) => {
        // ເພີ່ມ item ໃໝ່
        await prisma.itemOnCart.create({
          data: {
            cartId: parseInt(cartId),
            orderId: parseInt(cartId),
            saleCarId: parseInt(saleCarId),
            quantity: parseInt(quantity) || 1,
            price: parseFloat(price) || 0
          }
        });

        // ປ່ຽນສະຖານະລົດ
        await prisma.saleCar.update({
          where: { id: parseInt(saleCarId) },
          data: { status: "Reserved" }
        });

        // ອັບເດດລາຄາລວມ
        const totalAmount = await prisma.itemOnCart.aggregate({
          where: { cartId: parseInt(cartId) },
          _sum: { price: true }
        });

        await prisma.cart.update({
          where: { id: parseInt(cartId) },
          data: { totalAmount: totalAmount._sum.price || 0 }
        });
      });

    } else if (action === "remove") {
      const cartItem = await prisma.itemOnCart.findFirst({
        where: {
          cartId: parseInt(cartId),
          saleCarId: parseInt(saleCarId)
        }
      });

      if (!cartItem) {
        return res.status(404).json({
          success: false,
          message: "ບໍ່ພົບລາຍການໃນກະຕ່າ"
        });
      }

      await prisma.$transaction(async (prisma) => {
        // ລົບ item
        await prisma.itemOnCart.delete({
          where: { id: cartItem.id }
        });

        // ຄືນສະຖານະລົດ
        await prisma.saleCar.update({
          where: { id: parseInt(saleCarId) },
          data: { status: "Available" }
        });

        // ອັບເດດລາຄາລວມ
        const totalAmount = await prisma.itemOnCart.aggregate({
          where: { cartId: parseInt(cartId) },
          _sum: { price: true }
        });

        await prisma.cart.update({
          where: { id: parseInt(cartId) },
          data: { totalAmount: totalAmount._sum.price || 0 }
        });
      });
    }

    // ດຶງຂໍ້ມູນ cart ທີ່ອັບເດດແລ້ວ
    const updatedCart = await prisma.cart.findUnique({
      where: { id: parseInt(cartId) },
      include: {
        customer: true,
        ItemOnCart: {
          include: {
            saleCar: {
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true,
                    images: { take: 1 }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: "ອັບເດດກະຕ່າສຳເລັດແລ້ວ",
      data: updatedCart
    });

  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການອັບເດດ"
    });
  }
};