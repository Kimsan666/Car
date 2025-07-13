const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  try {
    // ກຳນົດຕົວແປຮັບຄາຈາກ FontEnd ສົ່ງມາ
    const { username, password } = req.body;

    // ກວດສອບຖ້າບໍ່ມີຄ່າ username ສົ່ງມາ ກໍແຈ້ງບອກຜູ້ໃຊ້

    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }
    // ຖ້າບໍ່ມີຄ່າ password ສົ່ງມາ ກໍແຈ້ງບອກຜູ້ໃຊ້
    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }
    // ໄປຫາຂໍ້ມູນມູນ username ຢູ່ຖານຂໍ້ມູນ
    const user = await prisma.user.findUnique({
      where: { username: username },
    });
    // ກວດສອບຖ້າມີ username ຢູ່ແລ້ວຈະບໍ່ສາມາດບັນທຶກໄດ້
    if (user) {
      return res.status(400).json({ message: "username already exists" });
    }

    // ເຂົ້າລະຫັດໃຫ້ Password ດ້ວຍ bcrypt ເຮັດໃຫ້ບໍ່ສາມາດອ່ານໄດ້ ແລະ ບໍ່ສາມາດຮູ້ຄ່າ password
    const hasderdPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username: username,
        password: hasderdPassword,
      },
    });

    res.send({ message: "ບັນທຶກຜູ້ໃຊ້ສໍາເລັດແລ້ວ" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error register in controller" });
  }
};
exports.login = async (req, res) => {
  try {
    // ກຳນົດຕົວແປຮັບຄາຈາກ FontEnd ສົ່ງມາ
    const { username, password } = req.body;
    if (!username && !password) {
      return res
        .status(400)
        .json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນ Username ແລະ Password" });
    }

    if (!username) {
      return res.status(400).json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນ Username" });
    }
    if (!password) {
      return res.status(400).json({ message: "ກະລຸນາປ້ອນຂໍ້ມູນ Password" });
    }
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user || !user.enabled) {
      return res
        .status(400)
        .json({ message: "ບໍ່ມີ username ຢູ່ ຫຼື ບໍ່ໄດ້ເປິດໃຊ້ງານ" });
    }
    // ກວດສອບລະຫັດໃນຖານຂໍ້ມູນ, bcrypt ແມ່ນການເຂົ້າລະຫັດໃຊ້ bcrypt.hash ແລະ ຖອດລະຫັດໃຊ້ bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "ລະຫັດບໍ່ຖືກ" });
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    // ສ້າງ token ສໍາລັບຜູ້ໃຊ້
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "server error" });
      }
      res.json({ message: "ເຂົ້າສູ່ລະບົບສຳເລັດ", payload, token });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server error register in controller" });
  }
};

exports.currentUser = async (req, res) => {
  //code
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
      select: {
        id: true,
        username: true,
        role: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            email: true,
            position: true,
          },
        },
      },
    });
    res.json({ user });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "server error currentUser in controller!!!" });
  }
};
