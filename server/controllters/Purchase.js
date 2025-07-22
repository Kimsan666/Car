const prisma = require("../config/prisma");

// ຟັງຊັນສ້າງ Purchase ໃໝ່
exports.savePurchase = async (req, res) => {
  try {
    const {
      supplierId,
      expectedDeliveryDate,
      products, // array ຂອງ { carId, quantity }
      orderdById,
    } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!orderdById) {
      return res.status(400).json({
        message: "ກະລຸນາລະບຸຜູ້ສັ່ງຊື້",
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "ກະລຸນາເລືອກສິນຄ້າທີ່ຕ້ອງການສັ່ງຊື້",
      });
    }

    // ກວດສອບວ່າ User ມີຢູ່ຈິງຫຼືບໍ່
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(orderdById),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ທີ່ລະບຸ",
      });
    }

    // ກວດສອບວ່າ Supplier ມີຢູ່ຈິງຫຼືບໍ່ (ຖ້າລະບຸ)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: {
          id: parseInt(supplierId),
        },
      });

      if (!supplier) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບສິນຄ້າທັງໝົດ
    const carIds = products.map((p) => parseInt(p.carId));
    const cars = await prisma.car.findMany({
      where: {
        id: { in: carIds },
      },
    });

    if (cars.length !== carIds.length) {
      return res.status(400).json({
        message: "ມີບາງລົດທີ່ບໍ່ພົບໃນລະບົບ",
      });
    }

    // ກວດສອບ quantity
    for (let product of products) {
      if (!product.quantity || product.quantity <= 0) {
        return res.status(400).json({
          message: "ຈຳນວນສິນຄ້າຕ້ອງມີຄ່າມากກວ່າ 0",
        });
      }
    }

    // ຄິດໄລ່ຈຳນວນທັງໝົດ
    const quantitytotal = products.reduce(
      (sum, product) => sum + parseInt(product.quantity),
      0
    );

    // ສ້າງ Purchase ພ້ອມ ItemOnPurchase
    const purchase = await prisma.purchase.create({
      data: {
        supplierId: supplierId ? parseInt(supplierId) : null,
        expectedDeliveryDate: expectedDeliveryDate
          ? new Date(expectedDeliveryDate)
          : null,
        quantitytotal: quantitytotal,
        orderdById: parseInt(orderdById),
        status: "PENDING",
        products: {
          create: products.map((product) => ({
            carId: parseInt(product.carId),
            quantity: parseInt(product.quantity),
          })),
        },
      },
      
    });

    res.status(201).json({
      message: "ສ້າງໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: purchase,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error savePurchase in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານໃບສັ່ງຊື້ທັງໝົດ
exports.listPurchases = async (req, res) => {
  try {
    const { status, supplierId, orderdById } = req.query;

    // ສ້າງເງື່ອນໄຂການຄົ້ນຫາ
    let whereCondition = {};

    if (status) {
      whereCondition.status = status;
    }

    if (supplierId) {
      whereCondition.supplierId = parseInt(supplierId);
    }

    if (orderdById) {
      whereCondition.orderdById = parseInt(orderdById);
    }

    const purchases = await prisma.purchase.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                brandCars: {
                  select: {
                    name: true,
                  },
                },
                typecar: {
                  select: {
                    name: true,
                  },
                },
                brandAndModels: {
                  select: {
                    modelCar: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.json({
      message: "ດຶງຂໍ້ມູນໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: purchases,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error listPurchases in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານໃບສັ່ງຊື້ແຕ່ລະໃບ
exports.readPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    const purchase = await prisma.purchase.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
          },
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
                position: true,
              },
            },
          },
        },
        products: {
          include: {
            Car: {
              include: {
                brandAndModels: {
                  include: {
                    BrandCars: true,
                  },
                },
                colorCar: true,
                typecar: true,
                images: true,
              },
            },
          },
        },
        InputCar: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!purchase) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນໃບສັ່ງຊື້",
      });
    }

    res.json({
      message: "ດຶງຂໍ້ມູນໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: purchase,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error readPurchase in controller!!!",
    });
  }
};

// ຟັງຊັນອັບເດດໃບສັ່ງຊື້
exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expectedDeliveryDate, supplierId, products } = req.body;

    // ກວດສອບວ່າໃບສັ່ງຊື້ມີຢູ່ຫຼືບໍ່
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: Number(id) },
      include: { products: true },
    });

    if (!existingPurchase) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນໃບສັ່ງຊື້",
      });
    }

    // ກວດສອບສະຖານະທີ່ອະນຸຍາດ
    const allowedStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "ສະຖານະບໍ່ຖືກຕ້ອງ",
      });
    }

    // ຖ້າສະຖານະເປັນ DELIVERED ຫຼື CANCELLED ແລ້ວ ບໍ່ສາມາດແກ້ໄຂໄດ້
    if (["DELIVERED", "CANCELLED"].includes(existingPurchase.status)) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດແກ້ໄຂໃບສັ່ງຊື້ທີ່ສົ່ງແລ້ວຫຼືຍົກເລີກແລ້ວ",
      });
    }

    // ກວດສອບ Supplier (ຖ້າມີການແກ້ໄຂ)
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: parseInt(supplierId) },
      });

      if (!supplier) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງທີ່ລະບຸ",
        });
      }
    }

    // ເຕรຽມຂໍ້ມູນສຳລັບອັບເດດ
    let updateData = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = expectedDeliveryDate
        ? new Date(expectedDeliveryDate)
        : null;
    }
    if (supplierId !== undefined) {
      updateData.supplierId = supplierId ? parseInt(supplierId) : null;
    }

    // ຖ້າມີການແກ້ໄຂສິນຄ້າ
    if (products && Array.isArray(products)) {
      // ກວດສອບສິນຄ້າທັງໝົດ
      const carIds = products.map((p) => parseInt(p.carId));
      const cars = await prisma.car.findMany({
        where: { id: { in: carIds } },
      });

      if (cars.length !== carIds.length) {
        return res.status(400).json({
          message: "ມີບາງລົດທີ່ບໍ່ພົບໃນລະບົບ",
        });
      }

      // ຄິດໄລ່ຈຳນວນໃໝ່
      const quantitytotal = products.reduce(
        (sum, product) => sum + parseInt(product.quantity),
        0
      );
      updateData.quantitytotal = quantitytotal;

      // ລົບ ItemOnPurchase ເກົ່າ ແລະສ້າງໃໝ່
      await prisma.itemOnPurchase.deleteMany({
        where: { purchaseId: Number(id) },
      });

      updateData.products = {
        create: products.map((product) => ({
          carId: parseInt(product.carId),
          quantity: parseInt(product.quantity),
        })),
      };
    }

    // ອັບເດດໃບສັ່ງຊື້
    const updatedPurchase = await prisma.purchase.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                price: true,
                costPrice: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "ອັບເດດໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: updatedPurchase,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updatePurchase in controller!!!",
    });
  }
};

// ຟັງຊັນລົບໃບສັ່ງຊື້
exports.removePurchase = async (req, res) => {
  try {
    const { id } = req.params;

    // ກວດສອບວ່າໃບສັ່ງຊື້ມີຢູ່ຫຼືບໍ່
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: Number(id) },
      
    });

    if (!existingPurchase) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນໃບສັ່ງຊື້",
      });
    }

    // ກວດສອບສະຖານະ - ບໍ່ສາມາດລົບໃບສັ່ງຊື້ທີ່ CONFIRMED ຫຼື DELIVERED
    if (["CONFIRMED", "DELIVERED"].includes(existingPurchase.status)) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບໃບສັ່ງຊື້ທີ່ຢືນຢັນຫຼືສົ່ງແລ້ວ",
      });
    }

    // ກວດສອບວ່າມີ InputCar ເຊື່ອມຕໍ່ຫຼືບໍ່
    if (existingPurchase.InputCar && existingPurchase.InputCar.length > 0) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບໃບສັ່ງຊື້ທີ່ມີການນຳເຂົ້າແລ້ວ",
      });
    }

    // ລົບໃບສັ່ງຊື້ (ItemOnPurchase ຈະຖືກລົບອັດຕະໂນມັດດ້ວຍ Cascade)
    const deletedPurchase = await prisma.purchase.delete({
      where: { id: Number(id) },
    });

    res.json({
      message: "ລົບໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: {
        id: deletedPurchase.id,
        status: deletedPurchase.status,
        quantitytotal: deletedPurchase.quantitytotal,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error removePurchase in controller!!!",
    });
  }
};

// ຟັງຊັນຄົ້ນຫາໃບສັ່ງຊື້
exports.searchPurchases = async (req, res) => {
  try {
    const { query, status, supplierId, dateFrom, dateTo } = req.body;

    let whereCondition = {};

    // ຖ້າມີການຄົ້ນຫາດ້ວຍຂໍ້ຄວາມ
    if (query && query.trim() !== "") {
      whereCondition.OR = [
        {
          supplier: {
            companyName: {
              contains: query.trim(),
            },
          },
        },
        {
          orderdBy: {
            username: {
              contains: query.trim(),
            },
          },
        },
        {
          orderdBy: {
            employee: {
              firstName: {
                contains: query.trim(),
              },
            },
          },
        },
        {
          products: {
            some: {
              Car: {
                name: {
                  contains: query.trim(),
                },
              },
            },
          },
        },
      ];
    }

    // ກັ່ນຕອງຕາມສະຖານະ
    if (status) {
      whereCondition.status = status;
    }

    // ກັ່ນຕອງຕາມຜູ້ສະໜອງ
    if (supplierId) {
      whereCondition.supplierId = parseInt(supplierId);
    }

    // ກັ່ນຕອງຕາມວັນທີ
    if (dateFrom || dateTo) {
      whereCondition.createdAt = {};
      if (dateFrom) {
        whereCondition.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereCondition.createdAt.lte = new Date(dateTo);
      }
    }

    const purchases = await prisma.purchase.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
          },
        },
        orderdBy: {
          select: {
            id: true,
            username: true,
            employee: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        products: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                price: true,
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    res.json({
      message: "ຄົ້ນຫາໃບສັ່ງຊື້ສຳເລັດແລ້ວ",
      data: purchases,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error searchPurchases in controller!!!",
    });
  }
};

// ຟັງຊັນປ່ຽນສະຖານະໃບສັ່ງຊື້
exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ກວດສອບສະຖານະທີ່ອະນຸຍາດ
    const allowedStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "ສະຖານະບໍ່ຖືກຕ້ອງ",
      });
    }

    // ກວດສອບວ່າໃບສັ່ງຊື້ມີຢູ່ຫຼືບໍ່
    const existingPurchase = await prisma.purchase.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPurchase) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນໃບສັ່ງຊື້",
      });
    }

    // ກວດສອບການປ່ຽນສະຖານະທີ່ອະນຸຍາດ
    const statusFlow = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["DELIVERED", "CANCELLED"],
      DELIVERED: [], // ບໍ່ສາມາດປ່ຽນຫາສະຖານະອື່ນໄດ້
      CANCELLED: [], // ບໍ່ສາມາດປ່ຽນຫາສະຖານະອື່ນໄດ້
    };

    if (!statusFlow[existingPurchase.status].includes(status)) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດປ່ຽນສະຖານະຈາກ ${existingPurchase.status} ເປັນ ${status} ໄດ້`,
      });
    }

    // ອັບເດດສະຖານະ
    const updatedPurchase = await prisma.purchase.update({
      where: { id: Number(id) },
      data: {
        status: status,
        updatedAt: new Date(),
      },
      
    });

    res.json({
      message: `ປ່ຽນສະຖານະໃບສັ່ງຊື້ເປັນ ${status} ສຳເລັດແລ້ວ`,
      data: updatedPurchase,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updatePurchaseStatus in controller!!!",
    });
  }
};
