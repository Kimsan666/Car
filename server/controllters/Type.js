const prisma = require("../config/prisma");

exports.saveType = async (req, res) => {
  try {
    // ກຳນົດຕົວແປຮັບຄາຈາກ FontEnd ສົ່ງມາ
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "ກະລຸນາປ້ອນຊື່ປະເພດກ່ອນ" });
    }

    const Name = await prisma.typeCar.findUnique({
      where: {
        name: name,
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ປະເພດນີ້ໃນ ຕາລາງປະເພດແລ້ວ" });
    }
    const Brand = await prisma.typeCar.create({
      data: {
        name: name,
      },
    });

    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error save type" });
  }
};

exports.listType = async (req, res) => {
  try {
    const Brand = await prisma.typeCar.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list type" });
  }
};

exports.readType= async (req, res) => {
  try {
    const { id } = req.params;
    const Brand = await prisma.typeCar.findFirst({
      where: {
        id: Number(id),
      },
    });
    res.json(Brand);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error read typeCar" });
  }
};

exports.updateType = async (req, res) => {
  try {
    const { name } = req.body;
    const brandId = Number(req.params.id);

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const Name = await prisma.typeCar.findUnique({
      where: {
        name: name,
        NOT: { id: brandId },
      },
    });
    if (Name) {
      return res
        .status(400)
        .json({ message: "ມີຊື່ປະເພດນີ້ໃນ ຕາລາງປະເພດແລ້ວ" });
    }

    const existingBrand = await prisma.typeCar.findFirst({
      where: {
        name: name,
        NOT: { id: brandId },
      },
    });

    if (existingBrand) {
      return res.status(400).json({ message: "name already exists" });
    }

    const Brand = await prisma.typeCar.update({
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
    res.status(500).json({ message: "server error update typeCar" });
  }
};



exports.deleteType = async (req, res) => {
  try {
    const { id } = req.params;
    const typeCarId = Number(id);

    const brand = await prisma.typeCar.findUnique({
      where: { id: typeCarId },
    });

    if (!brand) {
      return res.status(404).json({ message: "ບໍ່ພົບແບນນີ້" });
    }

    const relatedcars= await prisma.car.findMany({
      where: {
        typeId: typeCarId,
      },
    });

    if (relatedcars.length > 0) {
      return res.status(400).json({
        message: `ບໍ່ສາມາດລົບແບນ "${brand.name}" ໄດ້ ເນື່ອງຈາກຍັງມີສິນຄ້າໃນ car ໃຊ້ຢູ່`,
      });
    }
  
    const deletedBrand = await prisma.typeCar.delete({
      where: { id: typeCarId },
    });

    res.json({ message: `ລົບແບນ "${deletedBrand.name}" ສຳເລັດ` });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error delete Brand" });
  }
};

