const prisma = require("../config/prisma");

// 1. ສ້າງລູກຄ້າໃໝ່
exports.createCustomer = async (req, res) => {
  try {
    const {
      fname,
      lname,
      number,
      email,
      address,
      numberDocuments,
      documentsType,
      images
    } = req.body;

    // ສ້າງລູກຄ້າ (ຂໍ້ມູນໄດ້ຖືກ validate ແລ້ວໃນ middleware)
    const customer = await prisma.customer.create({
      data: {
        fname: fname.trim(),
        lname: lname.trim(),
        number: number.trim(),
        email: email.toLowerCase().trim(),
        address: address ? address.trim() : null,
        numberDocuments: numberDocuments.trim(),
        documentsType: documentsType.toLowerCase(),
        enabled: true,
        // ບັນທຶກຮູບພາບເອກະສານ (ຖ້າມີ)
        images: images && images.length > 0 ? {
          create: images.map((item) => ({
            asset_id: item.asset_id,
            public_id: item.public_id,
            url: item.url,
            secure_url: item.secure_url,
          })),
        } : undefined,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      message: "ສ້າງຂໍ້ມູນລູກຄ້າສຳເລັດແລ້ວ",
      data: customer
    });

  } catch (error) {
    console.log(error);
    
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('email')) {
        return res.status(400).json({
          message: "ມີອີເມວນີ້ຢູ່ແລ້ວໃນລະບົບ"
        });
      }
      if (target && target.includes('numberDocuments')) {
        return res.status(400).json({
          message: "ມີເລກເອກະສານນີ້ຢູ່ແລ້ວໃນລະບົບ"
        });
      }
    }
    
    res.status(500).json({
      message: "Server error createCustomer in controller!!!"
    });
  }
};

// 2. ດຶງລາຍຊື່ລູກຄ້າທັງໝົດ (ທີ່ເປີດໃຊ້ງານ)
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { enabled: true },
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        Order: {
          include: {
            ItemOnOrder: {
              include: {
                Car: {
                  select: {
                    name: true,
                    licensePlate: true,
                  }
                }
              }
            }
          }
        }
      },
    });

    res.json({
      message: "ດຶງຂໍ້ມູນລູກຄ້າສຳເລັດແລ້ວ",
      data: customers
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ 
      message: "Server error getAllCustomers in controller!!!" 
    });
  }
};

// 3. ດຶງລົດທີ່ສາມາດຂາຍໄດ້ (ສະຖານະ Available)
exports.getAvailableCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: { 
        status: 'Available'
      },
      include: {
        brandAndModels: {
          include: {
            BrandCars: true
          }
        },
        colorCar: true,
        typecar: true,
        brandCars: true,
        images: true,
        imaged: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: "ດຶງຂໍ້ມູນລົດສຳເລັດແລ້ວ",
      data: cars
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error getAvailableCars in controller!!!"
    });
  }
};

// 4. ສ້າງຄຳສັ່ງຊື້ (ການຂາຍ)
exports.createOrder = async (req, res) => {
  try {
    const {
      customerId,
      customerData,
      carIds,
      totalAmount,
      orderdById
    } = req.body;

    // ໃຊ້ transaction ເພື່ອຮັບປະກັນການຄົງຕົວຂອງຂໍ້ມູນ
    const result = await prisma.$transaction(async (tx) => {
      let finalCustomerId = customerId;

      // ຖ້າບໍ່ມີ customerId ໃຫ້ສ້າງລູກຄ້າໃໝ່
      if (!customerId && customerData) {
        const newCustomer = await tx.customer.create({
          data: {
            fname: customerData.fname.trim(),
            lname: customerData.lname.trim(),
            number: customerData.number.trim(),
            email: customerData.email.toLowerCase().trim(),
            address: customerData.address ? customerData.address.trim() : null,
            numberDocuments: customerData.numberDocuments.trim(),
            documentsType: customerData.documentsType.toLowerCase(),
            enabled: true,
            // ບັນທຶກຮູບພາບເອກະສານ (ຖ້າມີ)
            images: customerData.images && customerData.images.length > 0 ? {
              create: customerData.images.map((item) => ({
                asset_id: item.asset_id,
                public_id: item.public_id,
                url: item.url,
                secure_url: item.secure_url,
              })),
            } : undefined,
          }
        });
        finalCustomerId = newCustomer.id;
      }

      // ສ້າງ Order
      const order = await tx.order.create({
        data: {
          customerId: finalCustomerId,
          totalAmount: parseFloat(totalAmount),
          orderdById: orderdById
        }
      });

      // ສ້າງ ItemOnOrder ສຳລັບແຕ່ລະລົດ
      const orderItems = await Promise.all(
        carIds.map(carId => 
          tx.itemOnOrder.create({
            data: {
              carId: carId
            }
          })
        )
      );

      // ອັບເດດສະຖານະລົດເປັນ "Sold"
      await tx.car.updateMany({
        where: {
          id: { in: carIds }
        },
        data: {
          status: 'Sold'
        }
      });

      return {
        order,
        orderItems,
        soldCars: carIds.length
      };
    });

    res.status(201).json({
      message: `ສ້າງຄຳສັ່ງຊື້ສຳເລັດແລ້ວ! ຂາຍລົດໄດ້ ${result.soldCars} ຄັນ`,
      data: result.order
    });

  } catch (error) {
    console.log(error);

    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target && target.includes('email')) {
        return res.status(400).json({
          message: "ອີເມວລູກຄ້າມີໃນລະບົບແລ້ວ"
        });
      }
      if (target && target.includes('numberDocuments')) {
        return res.status(400).json({
          message: "ເລກເອກະສານລູກຄ້າມີໃນລະບົບແລ້ວ"
        });
      }
    }

    res.status(500).json({
      message: error.message || "Server error createOrder in controller!!!"
    });
  }
};

// 5. ດຶງລາຍການ Orders ທັງໝົດ
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          include: {
            images: true
          }
        },
        orderdBy: {
          include: {
            employee: true
          }
        },
        ItemOnOrder: {
          include: {
            Car: {
              include: {
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                colorCar: true,
                typecar: true,
                brandCars: true,
                images: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: "ດຶງຂໍ້ມູນການສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: orders
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error getAllOrders in controller!!!"
    });
  }
};

// 6. ດຶງ Order ໂດຍ ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: {
          include: {
            images: true
          }
        },
        orderdBy: {
          include: {
            employee: true
          }
        },
        ItemOnOrder: {
          include: {
            Car: {
              include: {
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                colorCar: true,
                typecar: true,
                brandCars: true,
                images: true,
                imaged: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນການສັ່ງຊື້ນີ້"
      });
    }

    res.json({
      message: "ດຶງຂໍ້ມູນການສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: order
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error getOrderById in controller!!!"
    });
  }
};

// 7. ຍົກເລີກການຂາຍ (ປ່ຽນສະຖານະລົດກັບຄືນ)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.$transaction(async (tx) => {
      // ດຶງຂໍ້ມູນ Order ກັບລົດທີ່ຂາຍ
      const order = await tx.order.findUnique({
        where: { id: parseInt(id) },
        include: {
          ItemOnOrder: {
            include: {
              Car: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('ບໍ່ພົບຂໍ້ມູນການສັ່ງຊື້ນີ້');
      }

      // ປ່ຽນສະຖານະລົດກັບຄືນເປັນ Available
      const carIds = order.ItemOnOrder.map(item => item.Car.id);
      await tx.car.updateMany({
        where: {
          id: { in: carIds }
        },
        data: {
          status: 'Available'
        }
      });

      // ລຶບ ItemOnOrder
      await tx.itemOnOrder.deleteMany({
        where: {
          id: { in: order.ItemOnOrder.map(item => item.id) }
        }
      });

      // ລຶບ Order
      await tx.order.delete({
        where: { id: parseInt(id) }
      });

      return {
        canceledCars: carIds.length
      };
    });

    res.json({
      message: `ຍົກເລີກການຂາຍສຳເລັດແລ້ວ! ປ່ຽນສະຖານະລົດ ${result.canceledCars} ຄັນກັບຄືນເປັນສາມາດຂາຍໄດ້`
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message || "Server error cancelOrder in controller!!!"
    });
  }
};