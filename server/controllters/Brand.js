const prisma = require("../config/prisma");

exports.savebrand = async (req, res) => {
  try {
    // ກຳນົດຕົວແປຮັບຄາຈາກ FontEnd ສົ່ງມາ
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ແບນກ່ອນ" });
    }

    const Name = await prisma.brandCars.findUnique({
      where: {
        name: name,
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ແບນນີ້ໃນ ຕາລາງແບນແລ້ວ" });
    }
    const Brand = await prisma.brandCars.create({
      data: {
        name: name,
      },
    });

    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error save Brand" });
  }
};

exports.listbrand = async (req, res) => {
  try {
    const Brand = await prisma.brandCars.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list Brand" });
  }
};

exports.readbrand= async (req, res) => {
  try {
    const { id } = req.params;
    const Brand = await prisma.brandCars.findFirst({
      where: {
        id: Number(id),
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error read Brand" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const brandId = Number(req.params.id);

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const Name = await prisma.brandCars.findUnique({
      where: {
        name: name,
        NOT: { id: brandId },
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ແບນນີ້ໃນ ຕາລາງແບນແລ້ວ" });
    }

    const existingBrand = await prisma.brandCars.findFirst({
      where: {
        name: name,
        NOT: { id: brandId },
      },
    });

    if (existingBrand) {
      return res.status(400).json({ message: "name already exists" });
    }

    const Brand = await prisma.brandCars.update({
      where: {
        id: brandId,
      },
      data: {
        name: name,
        updatedAt: new Date(), // อัปเดตเวลาที่แก้ไขล่าสุด
      },
    });

    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error update category" });
  }
};



exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = Number(id);

    const brand = await prisma.brandCars.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return res.status(404).json({ message: "ບໍ່ພົບແບນນີ້" });
    }

    const relatedcars= await prisma.car.findMany({
      where: {
        brandCarsId: brandId,
      },
    });

    const relatedBrandAndModels = await prisma.brandAndModels.findMany({
      where: {
        brandCarsId: brandId,
      },
    });


    if (relatedcars.length > 0) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດລົບແບນ "${brand.name}" ໄດ້ ເນື່ອງຈາກຍັງມີສິນຄ້າໃນ car ໃຊ້ຢູ່`,
      });
    }

    if (relatedBrandAndModels.length > 0) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດລົບແບນ "${brandAndModels.name}" ໄດ້ ເນື່ອງຈາກຍັງຖືກໃຊ້ໃນ BandAndModels`,
      });
    }

    const deletedBrand = await prisma.brandCars.delete({
      where: { id: brandId },
    });

    res.json({ message: `ລົບແບນ "${deletedBrand.name}" ສຳເລັດ` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error delete Brand" });
  }
};

