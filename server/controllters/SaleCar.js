const prisma = require("../config/prisma");

exports.saveSaleCar = async (req, res) => {
  try {
    const {
      carId,
      name,
      licensePlate,
     
      colorCarId,
      vin,
      engineNumber,
      status,
      price,
      costPrice,
    } = req.body;

    // ກວດສອບວ່າມີ licensePlate ຊ້ຳກັນຫຼືບໍ່ (ເມື່ອມີການປ້ອນຂໍ້ມູນເທົ່ານັ້ນ)
    if (licensePlate && licensePlate.trim() !== '') {
      const existingLicensePlate = await prisma.saleCar.findUnique({
        where: {
          licensePlate: licensePlate,
        },
      });

      if (existingLicensePlate) {
        return res.status(400).json({
          message: "ມີປ້າຍທະບຽນລົດນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    // ກວດສອບວ່າມີ VIN ຊ້ຳກັນຫຼືບໍ່ (ຖ້າມີການປ້ອນຂໍ້ມູນ)
    if (vin && vin.trim() !== '') {
      const existingVin = await prisma.saleCar.findUnique({
        where: {
          vin: vin,
        },
      });

      if (existingVin) {
        return res.status(400).json({
          message: "ມີເລກ VIN ນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    if (carId) {
      const car = await prisma.car.findUnique({
        where: {
          id: parseInt(carId),
        },
      });

      if (!car) {
        return res.status(400).json({
          message: "ບໍ່ພົບຂໍ້ມູນລົດທີ່ລະບຸ",
        });
      }
    }

    // ກວດສອບວ່າ Color ມີຢູ່ຈິງຫຼືບໍ່
    if (colorCarId) {
      const color = await prisma.colorCar.findUnique({
        where: {
          id: parseInt(colorCarId),
        },
      });

      if (!color) {
        return res.status(400).json({
          message: "ບໍ່ພົບສີລົດທີ່ລະບຸ",
        });
      }
    }

    // ສ້າງຂໍ້ມູນລົດພ້ອມຮູບພາບ
    const car = await prisma.saleCar.create({
      data: {
        carId: parseInt(carId),
        name: name,
        licensePlate: licensePlate || null,
  
        colorCarId: colorCarId ? parseInt(colorCarId) : null,
        vin: vin || null,
        engineNumber: engineNumber || null,
        status: status || "Available",
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
      },
    });

    res.status(201).json({
      message: "ບັນທຶກຂໍ້ມູນລົດສຳເລັດແລ້ວ",
      data: car,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error saveSaleCar in controller!!!",
    });
  }
};

exports.listSaleCar = async (req, res) => {
  try {
    const car = await prisma.saleCar.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        colorCar: {
          select: {
            name: true,
          },
        },
        car: {
          select: {
            description: true,
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
            images: true,
            imaged: true,
          },
        },
      },
    });
    res.json(car);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error list salecar" });
  }
};

exports.readSaleCar = async (req, res) => {
  try {
    const { id } = req.params;
    const salearId = Number(id);
    const car = await prisma.saleCar.findUnique({
      where: { id: salearId },
    });

    if (!car) {
      return res.status(404).json({ message: "ບໍ່ພົບຂໍ້ມູນລົດນີ້" });
    }

    const products = await prisma.saleCar.findFirst({
      where: {
        id: Number(id),
      },
      include: {
        colorCar: {
          select: {
            name: true,
          },
        },
        car: {
          select: {
            description: true,
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
            images: true,
            imaged: true,
          },
        },
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error readCar in controller!!!" });
  }
};

exports.updateSaleCar = async (req, res) => {
  try {
    const {
      carId,
      name,
      licensePlate,
   
      colorCarId,
      vin,
      engineNumber,
      status,
      price,
      costPrice,
    } = req.body;
    const { id } = req.params;

    // ກວດສອບວ່າມີ licensePlate ຊ້ຳກັນຫຼືບໍ່ (ເມື່ອມີການປ້ອນຂໍ້ມູນເທົ່ານັ້ນ)
    if (licensePlate && licensePlate.trim() !== '') {
      const existingLicensePlate = await prisma.saleCar.findUnique({
        where: {
          licensePlate: licensePlate,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existingLicensePlate) {
        return res.status(400).json({
          message: "ມີປ້າຍທະບຽນລົດນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    // ກວດສອບວ່າມີ VIN ຊ້ຳກັນຫຼືບໍ່ (ຖ້າມີການປ້ອນຂໍ້ມູນ)
    if (vin && vin.trim() !== '') {
      const existingVin = await prisma.saleCar.findUnique({
        where: {
          vin: vin,
          NOT: {
            id: Number(id),
          },
        },
      });

      if (existingVin) {
        return res.status(400).json({
          message: "ມີເລກ VIN ນີ້ຢູ່ແລ້ວ",
        });
      }
    }

    // ກວດສອບວ່າ Color ມີຢູ່ຈິງຫຼືບໍ່
    if (colorCarId) {
      const color = await prisma.colorCar.findUnique({
        where: {
          id: parseInt(colorCarId),
        },
      });

      if (!color) {
        return res.status(400).json({
          message: "ບໍ່ພົບສີລົດທີ່ລະບຸ",
        });
      }
    }

    const car = await prisma.saleCar.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        carId: parseInt(carId),
        name: name,
        licensePlate: licensePlate || null,
        
        colorCarId: colorCarId ? parseInt(colorCarId) : null,
        vin: vin || null,
        engineNumber: engineNumber || null,
        status: status || "Available",
        price: parseFloat(price),
        costPrice: parseFloat(costPrice),
      },
    });

    res.status(200).json({
      message: "ອັບເດດຂໍ້ມູນລົດສຳເລັດແລ້ວ",
      data: car,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error updateSaleCar in controller!!!",
    });
  }
};

exports.removeSaleCar = async (req, res) => {
  try {
    const { id } = req.params;

    // ໃຊ້ transaction ເພື່ອໃຫ້ແນ່ໃຈວ່າການລົບເຮັດວຽກຢ່າງປອດໄພ
    const result = await prisma.$transaction(async (prisma) => {
      // ຄົ້ນຫາລົດ Include ຂໍ້ມູນທີ່ກ່ຽວຂ້ອງ
      const car = await prisma.saleCar.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          colorCar: true,
          // ກວດສອບຂໍ້ມູນທີ່ເຊື່ອມຕໍ່ກັບລົດ
          ItemOnOrder: true,
          ItemOnCart: true,

        },
      });

      if (!car) {
        throw new Error("ບໍ່ພົບລົດທີ່ຕ້ອງການລົບ");
      }

      // ກວດສອບວ່າລົດຍັງຖືກໃຊ້ຢູ່ໃນຕາຕະລາງອື່ນຫຼືບໍ່
      if (car.ItemOnOrder.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະມີການສັ່ງຊື້ແລ້ວ");
      }
      if (car.ItemOnCart.length > 0) {
        throw new Error("ບໍ່ສາມາດລົບລົດໄດ້ເພາະມີການຈອງຢູ່");
      }


      // ລົບລົດ
      const deletedCar = await prisma.saleCar.delete({
        where: {
          id: Number(id),
        },
      });

      return deletedCar;
    });

    res.json({
      success: true,
      message: "ລົບລົດສຳເລັດແລ້ວ",
      data: result,
    });
  } catch (err) {
    console.log(err);

    // ກວດສອບ error message ເພື່ອສົ່ງ response ທີ່ເໝາະສົມ
    if (
      err.message.includes("ບໍ່ພົບລົດ") ||
      err.message.includes("ບໍ່ສາມາດລົບລົດໄດ້")
    ) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error removeCar in controller!!!",
      error: err.message,
    });
  }
};
