// ຟັງຊັນສ້າງ Supplier ໃໝ່
const prisma = require("../config/prisma");
exports.saveSupplier = async (req, res) => {
  try {
    const { companyName, contactName, email, phone, address } = req.body;

    // ກວດສອບຂໍ້ມູນທີ່ຈຳເປັນ
    if (!companyName || !email || !phone) {
      return res.status(400).json({
        message: "ກະລຸນາປ້ອນຊື່ບໍລິສັດ, ອີເມລ, ແລະເບີໂທທີ່ຈຳເປັນ",
      });
    }

    // ກວດສອບວ່າມີຊື່ບໍລິສັດຊ້ຳກັນຫຼືບໍ່
    const existingCompany = await prisma.supplier.findUnique({
      where: {
        companyName: companyName.trim(),
      },
    });

    if (existingCompany) {
      return res.status(400).json({
        message: "ມີຊື່ບໍລິສັດນີ້ຢູ່ແລ້ວໃນລະບົບ",
      });
    }

    // ກວດສອບວ່າມີອີເມລຊ້ຳກັນຫຼືບໍ່
    const existingEmail = await prisma.supplier.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "ມີອີເມລນີ້ຢູ່ແລ້ວໃນລະບົບ",
      });
    }

    // ກວດສອບວ່າມີເບີໂທຊ້ຳກັນຫຼືບໍ່
    const existingPhone = await prisma.supplier.findUnique({
      where: {
        phone: phone.trim(),
      },
    });

    if (existingPhone) {
      return res.status(400).json({
        message: "ມີເບີໂທນີ້ຢູ່ແລ້ວໃນລະບົບ",
      });
    }

    // ກວດສອບຮູບແບບອີເມລ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ",
      });
    }

    // ກວດສອບຮູບແບບເບີໂທ (ຕົວຢ່າງ: ຕ້ອງມີຢ່າງໜ້ອຍ 8 ໂຕເລກ)
    const phoneRegex = /^[0-9+\-\s()]{8,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ",
      });
    }

    // ສ້າງຂໍ້ມູນ Supplier
    const supplier = await prisma.supplier.create({
      data: {
        companyName: companyName.trim(),
        contactName: contactName ? contactName.trim() : null,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address ? address.trim() : null,
      },
      include: {
        supplierProducts: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
              },
            },
          },
        },
        Purchase: {
          select: {
            id: true,
            status: true,
            createdAt: true,
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

    res.status(201).json({
      message: "ບັນທຶກຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: supplier,
    });
  } catch (err) {
    console.log(err);

    // ກວດສອບ Prisma error
    if (err.code === "P2002") {
      const target = err.meta?.target;
      if (target && target.includes("companyName")) {
        return res.status(400).json({
          message: "ມີຊື່ບໍລິສັດນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      } else if (target && target.includes("email")) {
        return res.status(400).json({
          message: "ມີອີເມລນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      } else if (target && target.includes("phone")) {
        return res.status(400).json({
          message: "ມີເບີໂທນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      }
    }

    res.status(500).json({
      message: "Server error saveSupplier in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານຜູ້ສະໜອງທັງໝົດ
exports.listSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplierProducts: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                status: true,
              },
            },
          },
        },
        Purchase: {
          select: {
            id: true,
            status: true,
            quantitytotal: true,
            createdAt: true,
          },
        },
        InputCar: {
          select: {
            id: true,
            status: true,
            quantitytotal: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            supplierProducts: true,
            Purchase: true,
            InputCar: true,
          },
        },
      },
    });

    res.json({
      message: "ດຶງຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: suppliers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error listSuppliers in controller!!!",
    });
  }
};
exports.listSuppliersenabled = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: {
        enabled: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        supplierProducts: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
                status: true,
              },
            },
          },
        },
        Purchase: {
          select: {
            id: true,
            status: true,
            quantitytotal: true,
            createdAt: true,
          },
        },
        InputCar: {
          select: {
            id: true,
            status: true,
            quantitytotal: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            supplierProducts: true,
            Purchase: true,
            InputCar: true,
          },
        },
      },
    });

    res.json({
      message: "ດຶງຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: suppliers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error listSuppliers in controller!!!",
    });
  }
};

// ຟັງຊັນອ່ານຂໍ້ມູນຜູ້ສະໜອງແຕ່ລະລາຍ
exports.readSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        supplierProducts: {
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
                images: {
                  take: 1, // ເອົາແຕ່ຮູບທຳອິດ
                },
              },
            },
          },
        },
        Purchase: {
          include: {
            products: {
              include: {
                Car: {
                  select: {
                    name: true,
                    licensePlate: true,
                  },
                },
              },
            },
          },
        },
        InputCar: {
          include: {
            products: {
              include: {
                Car: {
                  select: {
                    name: true,
                    licensePlate: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!supplier) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງ",
      });
    }

    res.json({
      message: "ດຶງຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: supplier,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error readSupplier in controller!!!",
    });
  }
};

// ຟັງຊັນອັບເດດຂໍ້ມູນຜູ້ສະໜອງ
exports.updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyName, contactName, email, phone, address } = req.body;

    // ກວດສອບວ່າຜູ້ສະໜອງມີຢູ່ຫຼືບໍ່
    const existingSupplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
    });

    if (!existingSupplier) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງ",
      });
    }

    // ກວດສອບຊື່ບໍລິສັດຊ້ຳ (ຍົກເວັ້ນຜູ້ສະໜອງປັດຈຸບັນ)
    if (companyName && companyName !== existingSupplier.companyName) {
      const companyExists = await prisma.supplier.findUnique({
        where: { companyName: companyName.trim() },
      });

      if (companyExists) {
        return res.status(400).json({
          message: "ມີຊື່ບໍລິສັດນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      }
    }

    // ກວດສອບອີເມລຊ້ຳ (ຍົກເວັ້ນຜູ້ສະໜອງປັດຈຸບັນ)
    if (email && email !== existingSupplier.email) {
      const emailExists = await prisma.supplier.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (emailExists) {
        return res.status(400).json({
          message: "ມີອີເມລນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      }
    }

    // ກວດສອບເບີໂທຊ້ຳ (ຍົກເວັ້ນຜູ້ສະໜອງປັດຈຸບັນ)
    if (phone && phone !== existingSupplier.phone) {
      const phoneExists = await prisma.supplier.findUnique({
        where: { phone: phone.trim() },
      });

      if (phoneExists) {
        return res.status(400).json({
          message: "ມີເບີໂທນີ້ຢູ່ແລ້ວໃນລະບົບ",
        });
      }
    }

    // ກວດສອບຮູບແບບອີເມລ
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: "ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ",
        });
      }
    }

    // ກວດສອບຮູບແບບເບີໂທ
    if (phone) {
      const phoneRegex = /^[0-9+\-\s()]{8,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          message: "ຮູບແບບເບີໂທບໍ່ຖືກຕ້ອງ",
        });
      }
    }

    // ອັບເດດຂໍ້ມູນຜູ້ສະໜອງ
    const updatedSupplier = await prisma.supplier.update({
      where: { id: Number(id) },
      data: {
        companyName: companyName
          ? companyName.trim()
          : existingSupplier.companyName,
        contactName:
          contactName !== undefined
            ? contactName
              ? contactName.trim()
              : null
            : existingSupplier.contactName,
        email: email ? email.toLowerCase().trim() : existingSupplier.email,
        phone: phone ? phone.trim() : existingSupplier.phone,
        address:
          address !== undefined
            ? address
              ? address.trim()
              : null
            : existingSupplier.address,
        updatedAt: new Date(),
      },
      include: {
        supplierProducts: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
              },
            },
          },
        },
        _count: {
          select: {
            supplierProducts: true,
            Purchase: true,
            InputCar: true,
          },
        },
      },
    });

    res.json({
      message: "ອັບເດດຂໍ້ມູນຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: updatedSupplier,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updateSupplier in controller!!!",
    });
  }
};

// ຟັງຊັນລົບຜູ້ສະໜອງ
exports.removeSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // ກວດສອບວ່າຜູ້ສະໜອງມີການເຊື່ອມຕໍ່ກັບຂໍ້ມູນອື່ນຫຼືບໍ່
    const supplierWithRelations = await prisma.supplier.findUnique({
      where: { id: Number(id) },
      include: {
        supplierProducts: true,
        Purchase: true,
        InputCar: true,
      },
    });

    if (!supplierWithRelations) {
      return res.status(404).json({
        message: "ບໍ່ພົບຂໍ້ມູນຜູ້ສະໜອງ",
      });
    }

    // ກວດສອບການເຊື່ອມຕໍ່
    if (supplierWithRelations.supplierProducts.length > 0) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບຜູ້ສະໜອງໄດ້ເພາະຍັງມີສິນຄ້າເຊື່ອມຕໍ່ຢູ່",
      });
    }

    if (supplierWithRelations.Purchase.length > 0) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບຜູ້ສະໜອງໄດ້ເພາະຍັງມີການສັ່ງຊື້",
      });
    }

    if (supplierWithRelations.InputCar.length > 0) {
      return res.status(400).json({
        message: "ບໍ່ສາມາດລົບຜູ້ສະໜອງໄດ້ເພາະຍັງມີການນຳເຂົ້າ",
      });
    }

    // ລົບຜູ້ສະໜອງ
    const deletedSupplier = await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    res.json({
      message: "ລົບຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: deletedSupplier,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error removeSupplier in controller!!!",
    });
  }
};

// ຟັງຊັນຄົ້ນຫາຜູ້ສະໜອງ
exports.searchSuppliers = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === "") {
      return await exports.listSuppliers(req, res);
    }

    const suppliers = await prisma.supplier.findMany({
      where: {
        OR: [
          {
            companyName: {
              contains: query.trim(),
            },
          },
          {
            contactName: {
              contains: query.trim(),
            },
          },
          {
            email: {
              contains: query.trim(),
            },
          },
          {
            phone: {
              contains: query.trim(),
            },
          },
        ],
      },
      include: {
        supplierProducts: {
          include: {
            Car: {
              select: {
                id: true,
                name: true,
                licensePlate: true,
              },
            },
          },
        },
        _count: {
          select: {
            supplierProducts: true,
            Purchase: true,
            InputCar: true,
          },
        },
      },
    });

    res.json({
      message: "ຄົ້ນຫາຜູ້ສະໜອງສຳເລັດແລ້ວ",
      data: suppliers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error searchSuppliers in controller!!!",
    });
  }
};
