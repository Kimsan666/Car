const prisma = require("../config/prisma");

// ສ້າງອໍເດີໃໝ່
exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      totalAmount,
      items // [{ carId, quantity, price }]
    } = req.body;

    const userId = req.user.id; // ຈາກ middleware auth

    console.log("📦 Creating order with data:", { customerId, totalAmount, items, userId });

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!customerId || !totalAmount || !items || items.length === 0) {
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

    console.log("✅ Customer found:", customer.fname, customer.lname);

    // ✅ แก้ไข: ใช้ saleCar แทน car เพราะ status อยู่ใน saleCar
    const carIds = items.map(item => parseInt(item.carId));
    console.log("🚗 Looking for sale cars:", carIds);

    const cars = await prisma.saleCar.findMany({
      where: {
        id: { in: carIds },
        status: "Available" // ✅ status อยู่ใน saleCar model
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

    console.log("🔍 Found available cars:", cars.length);

    if (cars.length !== carIds.length) {
      return res.status(400).json({
        success: false,
        message: "ມີລົດບາງຄັນບໍ່ສາມາດຂາຍໄດ້ຫຼືບໍ່ມີຢູ່ໃນລະບົບ"
      });
    }

    // ສ້າງ transaction ເພື່ອຮັບປະກັນຄວາມຖືກຕ້ອງ
    const result = await prisma.$transaction(async (prisma) => {
      // ສ້າງ Order
      const order = await prisma.order.create({
        data: {
          orderdById: userId,
          customerId: parseInt(customerId),
          totalAmount: parseFloat(totalAmount)
        }
      });

      console.log("📋 Order created:", order.id);

      // ✅ แก้ไข: ใช้ saleCar แทน car
      const orderItems = [];
      for (const item of items) {
        const orderItem = await prisma.itemOnOrder.create({
          data: {
            orderId: order.id, // ✅ เพิ่ม orderId
            saleCarId: parseInt(item.carId), // ✅ ใช้ saleCarId แทน carId
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.price) || 0
          }
        });
        orderItems.push(orderItem);

        // ✅ อัพเดตสถานะ saleCar เป็น "Sold"
        await prisma.saleCar.update({
          where: { id: parseInt(item.carId) },
          data: { 
            status: "Sold",
            soldDate: new Date() // เพิ่มวันที่ขาย
          }
        });

        console.log(`✅ Sale car ${item.carId} marked as sold`);
      }

      return { order, orderItems };
    });

    // ดຶງຂໍ້ມູນ Order ພ້ອມລາຍລະອຽດ
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
            saleCar: { // ✅ ใช้ saleCar แทน Car
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

    console.log("🎉 Order created successfully:", orderWithDetails.id);

    res.status(201).json({
      success: true,
      message: `ສ້າງອໍເດີສຳເລັດແລ້ວ #${orderWithDetails.id}`,
      data: orderWithDetails
    });

  } catch (err) {
    console.error("❌ Error creating order:", err);
    
    // ກວດສອບ Prisma error
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

// ດຶງລາຍການອໍເດີທັງໝົດ
exports.listOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, startDate, endDate } = req.query;
    
    // ສ້າງ filter conditions
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

    // ດຶງຂໍ້ມູນ orders
    const orders = await prisma.order.findMany({
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
        ItemOnOrder: {
          include: {
            saleCar: { // ✅ ใช้ saleCar
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

    // ນັບຈຳນວນ orders ທັງໝົດ
    const totalOrders = await prisma.order.count({ where });
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error("Error listing orders:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ດຶງລາຍລະອຽດອໍເດີແຕ່ລະອັນ
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
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
        ItemOnOrder: {
          include: {
            saleCar: { // ✅ ใช้ saleCar
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບອໍເດີທີ່ລະບຸ"
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    console.error("Error getting order:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ອັບເດດສະຖານະອໍເດີ (ຖ້າຈຳເປັນ)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Pending", "Confirmed", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "ສະຖານະບໍ່ຖືກຕ້ອງ"
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບອໍເດີທີ່ລະບຸ"
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { 
        status: status,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        orderdBy: {
          select: {
            id: true,
            username: true
          }
        },
        ItemOnOrder: {
          include: {
            saleCar: { // ✅ ใช้ saleCar
              include: {
                car: {
                  include: {
                    brandCars: true,
                    typecar: true
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
      message: "ອັບເດດສະຖານະອໍເດີສຳເລັດແລ້ວ",
      data: updatedOrder
    });

  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ສະຖິຕິການຂາຍ
exports.getSalesStatistics = async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else {
      // Default ໃນເດືອນນີ້
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const endOfMonth = new Date();
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      };
    }

    // ຈຳນວນອໍເດີທັງໝົດ
    const totalOrders = await prisma.order.count({
      where: dateFilter
    });

    // ຍອດຂາຍລວມ
    const salesSum = await prisma.order.aggregate({
      where: dateFilter,
      _sum: {
        totalAmount: true
      }
    });

    // ຈຳນວນລົດທີ່ຂາຍ
    const soldCars = await prisma.itemOnOrder.count({
      where: {
        createdAt: dateFilter.createdAt
      }
    });

    // ✅ ລົດທີ່ຂາຍດີທີ່ສຸດ - ใช้ saleCarId แทน carId
    const topSellingCars = await prisma.itemOnOrder.groupBy({
      by: ['saleCarId'],
      where: {
        createdAt: dateFilter.createdAt
      },
      _count: {
        saleCarId: true
      },
      orderBy: {
        _count: {
          saleCarId: 'desc'
        }
      },
      take: 5
    });

    // ดḌึงลายละเอียดลีดที่ขายดี
    const topCarsDetails = await Promise.all(
      topSellingCars.map(async (item) => {
        const saleCar = await prisma.saleCar.findUnique({
          where: { id: item.saleCarId },
          include: {
            car: {
              include: {
                brandCars: true,
                typecar: true,
                images: { take: 1 }
              }
            },
            colorCar: true
          }
        });
        return {
          saleCar,
          soldCount: item._count.saleCarId
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSales: salesSum._sum.totalAmount || 0,
        soldCars,
        topSellingCars: topCarsDetails,
        period: {
          startDate: dateFilter.createdAt?.gte,
          endDate: dateFilter.createdAt?.lte
        }
      }
    });

  } catch (err) {
    console.error("Error getting sales statistics:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};

// ລົບອໍເດີ (ສຳລັບ admin ເທົ່ານັ້ນ)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        ItemOnOrder: {
          include: {
            saleCar: true // ✅ ใช้ saleCar
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "ບໍ່ພົບອໍເດີທີ່ລະບຸ"
      });
    }

    // ໃຊ້ transaction ເພື່ອຄືນສະຖານະລົດແລະລົບອໍເດີ
    await prisma.$transaction(async (prisma) => {
      // ✅ ຄືນສະຖານະ saleCar เປັນ Available
      for (const item of order.ItemOnOrder) {
        await prisma.saleCar.update({
          where: { id: item.saleCarId }, // ✅ ใช้ saleCarId
          data: { 
            status: "Available",
            soldDate: null // ลบวันที่ขาย
          }
        });
      }

      // ລົບ ItemOnOrder
      await prisma.itemOnOrder.deleteMany({
        where: { orderId: parseInt(id) }
      });

      // ລົบ Order
      await prisma.order.delete({
        where: { id: parseInt(id) }
      });
    });

    res.json({
      success: true,
      message: "ລົບອໍເດີສຳເລັດແລ້ວ"
    });

  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນການລົບອໍເດີ"
    });
  }
};