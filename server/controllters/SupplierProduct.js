// ຟັງຊັນສ້າງ SupplierProduct ໃໝ່ (ເຊື່ອມຕໍ່ຜູ້ສະໜອງກັບລົດ)
const prisma = require("../config/prisma");
exports.saveSupplierProduct = async (req, res) => {
  try {
    const {
      supplierId,
      carId,
      isActive,
      notes
    } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!supplierId || !carId) {
      return res.status(400).json({
        message: "ກະລຸນາເລືອກຜູ້ສະໜອງແລະລົດ"
      });
    }

    // ກວດສອບວ່າ Supplier ມີຢູ່ຈິງຫຼືບໍ່
    const supplier = await prisma.supplier.findUnique({
      where: {
        id: parseInt(supplierId),
      },
    });

    if (!supplier) {
      return res.status(400).json({
        message: "ບໍ່ພົບຂໍ້ມູນຼູ້ສະໜອງທີ່ລະບຸ"
      });
    }

    // ກວດສອບວ່າ Car ມີຢູ່ຈິງຫຼືບໍ່
    const car = await prisma.car.findUnique({
      where: {
        id: parseInt(carId),
      },
    });

    if (!car) {
      return res.status(400).json({
        message: "ບໍ່ພົບຂໍ້ມູນລົດທີ່ລະບຸ"
      });
    }

    // ກວດສອບວ່າມີການເຊື່ອມຕໍ່ນີ້ຢູ່ແລ້ວຫຼືບໍ່
    const existingRelation = await prisma.supplierProduct.findUnique({
      where: {
        supplierId_carId: {
          supplierId: parseInt(supplierId),
          carId: parseInt(carId),
        },
      },
    });

    if (existingRelation) {
      return res.status(400).json({
        message: "ມີການເຊື່ອມຕໍ່ລະຫວ່າງຜູ້ສະໜອງແລະລົດນີ້ຢູ່ແລ້ວ"
      });
    }

    // ສ້າງການເຊື່ອມຕໍ່ໃໝ່
    const supplierProduct = await prisma.supplierProduct.create({
      data: {
        supplierId: parseInt(supplierId),
        carId: parseInt(carId),
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
      },
      
    
    });

    res.status(201).json({
      message: "ເຊື່ອມຕໍ່ຜູ້ສະໜອງກັບລົດສຳເລັດແລ້ວ",
      data: supplierProduct,
    });

  } catch (err) {
    console.log(err);
    
    // ກວດສອບ Prisma error
    if (err.code === 'P2002') {
      return res.status(400).json({
        message: "ມີການເຊື່ອມຕໍ່ລະຫວ່າງຼູ້ສະໜອງແລະລົດນີ້ຢູ່ແລ້ວ",
      });
    }
    
    res.status(500).json({
      message: "Server error saveSupplierProduct in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານການເຊື່ອມຕໍ່ທັງໝົດ
exports.listSupplierProducts = async (req, res) => {
  try {
    const { supplierId, carId, isActive } = req.query;
    
    // ສ້າງເງື່ອນໄຂການຄົ້ນຫາ
    let whereCondition = {};
    
    if (supplierId) {
      whereCondition.supplierId = parseInt(supplierId);
    }
    
    if (carId) {
      whereCondition.carId = parseInt(carId);
    }
    
    if (isActive !== undefined) {
      whereCondition.isActive = isActive === 'true';
    }

    const supplierProducts = await prisma.supplierProduct.findMany({
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
          }
        },
        car: {
          include: {
            brandAndModels: {
              include: {
                BrandCars: true
              }
            },
            typecar: true,
            images: {
              take: 1,
            }
          }
        },
      },
    });
    
    res.json({
      message: "ດຶງຂໍ້ມູນການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ",
      data: supplierProducts
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      message: "Server error listSupplierProducts in controller!!!" 
    });
  }
};

// ຟັງຊັນອ່ານການເຊື່ອມຕໍ່ແຕ່ລະລາຍການ
exports.readSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supplierProduct = await prisma.supplierProduct.findFirst({
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
          }
        },
        Car: {
          include: {
            brandAndModels: {
              include: {
                BrandCars: true
              }
            },
            colorCar: true,
            typecar: true,
            images: true,
            imaged: true,
          }
        },
      },
    });
    
    if (!supplierProduct) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນການເຊື່ອມຕໍ່"
      });
    }
    
    res.json({
      message: "ດຶງຂໍ້ມູນການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ",
      data: supplierProduct
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      message: "Server error readSupplierProduct in controller!!!" 
    });
  }
};

// ຟັງຊັນອັບເດດການເຊື່ອມຕໍ່
exports.updateSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      isActive,
      notes
    } = req.body;

    // ກວດສອບວ່າການເຊື່ອມຕໍ່ມີຢູ່ຫຼືບໍ່
    const existingSupplierProduct = await prisma.supplierProduct.findUnique({
      where: { id: Number(id) }
    });

    if (!existingSupplierProduct) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນການເຊື່ອມຕໍ່"
      });
    }

    // ອັບເດດຂໍ້ມູນການເຊື່ອມຕໍ່
    const updatedSupplierProduct = await prisma.supplierProduct.update({
      where: { id: Number(id) },
      data: {
        isActive: isActive !== undefined ? isActive : existingSupplierProduct.isActive,
        notes: notes !== undefined ? notes : existingSupplierProduct.notes,
        updatedAt: new Date(),
      },
      include: {
        supplier: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          }
        },
        Car: {
          include: {
            brandAndModels: {
              include: {
                BrandCars: true
              }
            },
            colorCar: true,
            typecar: true,
            images: {
              take: 1,
            }
          }
        },
      },
    });

    res.json({
      message: "ອັບເດດການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ",
      data: updatedSupplierProduct,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updateSupplierProduct in controller!!!",
    });
  }
};

// ຟັງຊັນລົບການເຊື່ອມຕໍ່
exports.removeSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ກວດສອບວ່າການເຊື່ອມຕໍ່ມີຢູ່ຫຼືບໍ່
    const existingSupplierProduct = await prisma.supplierProduct.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: {
          select: {
            companyName: true,
          }
        },
        Car: {
          select: {
            name: true,
            licensePlate: true,
          }
        }
      }
    });

    if (!existingSupplierProduct) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນການເຊື່ອມຕໍ່"
      });
    }

    // ລົບການເຊື່ອມຕໍ່
    const deletedSupplierProduct = await prisma.supplierProduct.delete({
      where: { id: Number(id) }
    });

    res.json({
      message: "ລົບການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ",
      data: {
        id: deletedSupplierProduct.id,
        supplier: existingSupplierProduct.supplier.companyName,
        car: `${existingSupplierProduct.Car.name} (${existingSupplierProduct.Car.licensePlate})`
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error removeSupplierProduct in controller!!!",
    });
  }
};



// ຟັງຊັນເປີດ/ປິດການເຊື່ອມຕໍ່
exports.toggleSupplierProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ກວດສອບວ່າການເຊື່ອມຕໍ່ມີຢູ່ຫຼືບໍ່
    const existingSupplierProduct = await prisma.supplierProduct.findUnique({
      where: { id: Number(id) }
    });

    if (!existingSupplierProduct) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນການເຊື່ອມຕໍ່"
      });
    }

    // ສະຫຼັບສະຖານະ
    const updatedSupplierProduct = await prisma.supplierProduct.update({
      where: { id: Number(id) },
      data: {
        isActive: !existingSupplierProduct.isActive,
        updatedAt: new Date(),
      },
      include: {
        supplier: {
          select: {
            companyName: true,
          }
        },
        Car: {
          select: {
            name: true,
            licensePlate: true,
          }
        },
      },
    });

    res.json({
      message: `${updatedSupplierProduct.isActive ? 'ເປີດ' : 'ປິດ'}ການເຊື່ອມຕໍ່ສຳເລັດແລ້ວ`,
      data: updatedSupplierProduct,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error toggleSupplierProduct in controller!!!",
    });
  }
};