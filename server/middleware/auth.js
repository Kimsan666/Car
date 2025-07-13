const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

exports.authCheck = async (req, res, next) => {
  try {
    //ແມ່ນການໄປເອົາທີ່ຢູ່ຂອງ Token ຈາກ headers.authorization
    const headerToken = req.headers.authorization;
    //ຖ້າບໍ່ມີ ບໍ່ໃຫ້ໄປຕໍ່ມາທາງໃດກັບໄປທາງນັ້ນ
    if (!headerToken) {
      return res.status(400).json({ message: "no token authorization" });
    }
    //ປົກກະຕິດເວລາເອີນມາມັນຈະມາພ້ອມກັບ Bearer ຊື່ Token ເລີຍເລືອກເອົາແຕ່ຊື່ Token ໂດຍການກຳນົດ 1 ຖ້າເປັນ 0 ກະຄື Bearer
    const token = headerToken.split(" ")[1];
    //ກວດສອບວ່າແມ່ນ Token ແທ້ບໍ່ທີ່ສົ່ງມາ
    const decode = jwt.verify(token, process.env.SECRET);
    req.user = decode;

    const user = await prisma.user.findFirst({
      where: {
        username: req.user.username,
      },
    });
    //ກວດສອບວ່າແມ່ນ user ຖືກເປິດໃຊ້ງານຫຼືບໍ່
    if (!user.enabled) {
      return res.status(400).json({ message: "user not enabled" });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Token Invalid" });
  }
};

exports.adminCheck = async (req, res, next) => {
  try {
    const {username} = req.user
    const adminUser = await prisma.user.findFirst({
        where: {
            username: username,
        }
    })

    if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Acess denied: Admin Only" });
    }
    
    console.log('admin check',adminUser);
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "server Error you varify admin" });
  }
};
