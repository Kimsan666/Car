import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useCarStore from "../../Store/car-store";
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const togglePassword = () => setShowPassword((prev) => !prev);

  const actionLogin = useCarStore((state) => state.actionLogin);
  const user = useCarStore((state) => state.user);

  // console.log(user);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleOnChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role = res.data.payload.role;
      roleRedirect(role);
      const sucMsg = res.data?.message;
      toast.success(<p className="font-phetsarath">{sucMsg}</p>);
    } catch (err) {
      console.log(err);
      const errMsg = err.response?.data?.message;
      toast.error(<p className="font-phetsarath text-red-500">{errMsg}</p>);
    }
  };
  const roleRedirect = (role) => {
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full border-2 border-purple-300 opacity-30"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 rounded-full border-2 border-purple-300 opacity-30"></div>
        <div className="absolute top-1/4 -right-20 w-40 h-40 rounded-full border border-purple-200 opacity-40"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Login Form */}
            <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                    Log In
                  </h1>
                  <p className="text-gray-600">
                    Welcome back! Please enter your details
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleOnChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white/50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleOnChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 bg-white/50 pr-12"
                        placeholder="Enter your password"
                        maxLength={20}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] transition duration-200 shadow-lg"
                  >
                    Log in
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">
                        Or Continue With Admin
                      </span>
                    </div>
                  </div>

                  <div className="text-center mt-2">
                    <p className="text-gray-600 font-notosanslao ">
                      ບໍລິສັດ ພອນຈະເລີນ ຈຳກັດຜູ້ດຽວ <br />
                      ທີ່ຕັ້ງ: ເສັ້ນທາງເລກ 9 ບ້ານແດນສະຫວັນ ເມືືອງເຊໂປນ
                      ແຂວສະຫວັນນະເຂດ <br />
                      ໂທ: 20-9998-8999 || ອີເມວ: jim.company.lao@gmail.com{" "}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden min-h-[300px] lg:min-h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/80 to-pink-600/80"></div>
              <div className="relative z-10 h-full flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    Start your bright work today.
                  </h3>
                  <p className="text-purple-100 text-sm sm:text-base max-w-sm mx-auto">
                    Good liquor industry from abroad imported and with low tax
                    from Phonchalern Company
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 border border-white/30 rounded-full"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 border border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-10 w-8 h-8 bg-white/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
