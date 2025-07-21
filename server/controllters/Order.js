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

    // ກວດສອບວ່າລົດທັງໝົດມີຢູ່ແລະສາມາດຂາຍໄດ້
    const carIds = items.map(item => parseInt(item.carId));
    const cars = await prisma.car.findMany({
      where: {
        id: { in: carIds },
        status: "Available"
      }
    });

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

      // ສ້າງ ItemOnOrder ສຳລັບແຕ່ລະລາຍການ
      const orderItems = [];
      for (const item of items) {
        // ສ້າງ ItemOnOrder ສຳລັບແຕ່ລະ quantity
        for (let i = 0; i < item.quantity; i++) {
          const orderItem = await prisma.itemOnOrder.create({
            data: {
              carId: parseInt(item.carId),
              // ຖ້າຕ້ອງການ orderId, ຕ້ອງແກ້ໄຂ schema ກ່ອນ
              // orderId: order.id
            }
          });
          orderItems.push(orderItem);
        }

        // ອັບເດດສະຖານະລົດເປັນ "Sold"
        await prisma.car.update({
          where: { id: parseInt(item.carId) },
          data: { status: "Sold" }
        });
      }

      return { order, orderItems };
    });

    // ດຶງຂໍ້ມູນ Order ພ້ອມລາຍລະອຽດ
    const orderWithDetails = await prisma.order.findUnique({
      where: { id: result.order.id },
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
            Car: {
              include: {
                brandCars: true,
                colorCar: true,
                typecar: true,
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                images: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "ສ້າງອໍເດີສຳເລັດແລ້ວ",
      data: orderWithDetails
    });

  } catch (err) {
    console.error("Error creating order:", err);
    
    // ກວດສອບ Prisma error
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "ມີຂໍ້ມູນຊ້ຳກັນໃນລະບົບ"
      });
    }

    res.status(500).json({
      success: false,
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
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
            Car: {
              include: {
                brandCars: true,
                colorCar: true,
                typecar: true,
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                images: {
                  take: 1
                }
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
            Car: {
              include: {
                brandCars: true,
                colorCar: true,
                typecar: true,
                brandAndModels: {
                  include: {
                    BrandCars: true
                  }
                },
                images: true
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
            Car: {
              include: {
                brandCars: true,
                colorCar: true,
                typecar: true
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

    // ລົດທີ່ຂາຍດີທີ່ສຸດ
    const topSellingCars = await prisma.itemOnOrder.groupBy({
      by: ['carId'],
      where: {
        createdAt: dateFilter.createdAt
      },
      _count: {
        carId: true
      },
      orderBy: {
        _count: {
          carId: 'desc'
        }
      },
      take: 5
    });

    // ດຶງລາຍລະອຽດລົດທີ່ຂາຍດີ
    const topCarsDetails = await Promise.all(
      topSellingCars.map(async (item) => {
        const car = await prisma.car.findUnique({
          where: { id: item.carId },
          include: {
            brandCars: true,
            colorCar: true,
            typecar: true,
            images: { take: 1 }
          }
        });
        return {
          car,
          soldCount: item._count.carId
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
            Car: true
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
      // ຄືນສະຖານະລົດເປັນ Available
      for (const item of order.ItemOnOrder) {
        await prisma.car.update({
          where: { id: item.carId },
          data: { status: "Available" }
        });
      }

      // ລົບ ItemOnOrder
      await prisma.itemOnOrder.deleteMany({
        where: { 
          carId: { 
            in: order.ItemOnOrder.map(item => item.carId) 
          } 
        }
      });

      // ລົບ Order
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
      message: "ເກີດຂໍ້ຜິດພາດໃນເຊີເວີ"
    });
  }
};