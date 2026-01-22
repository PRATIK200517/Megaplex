"use client"
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  TrophyIcon, 
  LightBulbIcon, 
  ComputerDesktopIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  BuildingLibraryIcon,
  SparklesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              जि. प. प्राथमिक शाळा, जावळी
            </h1>
            <p className="text-2xl text-blue-100 mb-6">
              ज्ञान हेच अमृत, शिक्षण हेच जीवन!
            </p>
            <p className="text-lg text-white max-w-3xl mx-auto">
              जि. प. प्राथमिक शाळा, जावळी च्या अधिकृत वेबसाईटवर आपले सहर्ष स्वागत आहे.
            </p>
          </motion.div>
        </div>
      </div>

      {/* School Introduction */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <BookOpenIcon className="w-16 h-16 text-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">शाळेचा परिचय</h2>
            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                आमची शाळा ही केवळ एक इमारत नसून, ती ग्रामीण भागातील विद्यार्थ्यांच्या उज्ज्वल भविष्याची पायाभरणी करणारे एक पवित्र मंदिर आहे. आमच्या शाळेत विद्यार्थ्यांना केवळ पुस्तकी ज्ञान दिले जात नाही, तर त्यांच्यावर उत्तम संस्कार करून त्यांना एक जबाबदार आणि आदर्श नागरिक बनवण्याचा आम्ही प्रामाणिक प्रयत्न करतो.
              </p>
              <p>
                आधुनिक काळाची गरज ओळखून, आम्ही आमची जिल्हा परिषद शाळा आता 'डिजिटल' केली आहे, जेणेकरून आपल्या गावातील मुले जगाच्या स्पर्धेत कुठेही कमी पडणार नाहीत.
              </p>
            </div>
          </motion.div>

          {/* Vision & Mission */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">🎯 आमचे ध्येय</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                विद्यार्थ्यांचा सर्वांगीण विकास साधून, त्यांना आधुनिक तंत्रज्ञानाची ओळख करून देणे आणि गुणवत्तापूर्ण शिक्षणाच्या माध्यमातून एक सक्षम व सुसंस्कृत पिढी घडवणे.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-linear-to-br from-purple-50 to-purple-100 rounded-2xl p-8 shadow-lg"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <TrophyIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">🚀 आमची उद्दिष्टे</h3>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <StarIcon className="w-5 h-5 text-purple-600 mr-3 mt-1 shrink-0" />
                  <span>प्रत्येक विद्यार्थ्याला दर्जेदार आणि आनंददायी शिक्षण देणे.</span>
                </li>
                <li className="flex items-start">
                  <StarIcon className="w-5 h-5 text-purple-600 mr-3 mt-1 shrink-0" />
                  <span>डिजिटल साधनांचा (e-Learning) प्रभावी वापर करणे.</span>
                </li>
                <li className="flex items-start">
                  <StarIcon className="w-5 h-5 text-purple-600 mr-3 mt-1 shrink-0" />
                  <span>विद्यार्थ्यांमध्ये वाचनाची आवड, वैज्ञानिक दृष्टिकोन आणि आत्मविश्वास निर्माण करणे.</span>
                </li>
                <li className="flex items-start">
                  <StarIcon className="w-5 h-5 text-purple-600 mr-3 mt-1 shrink-0" />
                  <span>अभ्यासासोबतच कला, क्रीडा आणि सांस्कृतिक गुणांचा विकास करणे.</span>
                </li>
                <li className="flex items-start">
                  <StarIcon className="w-5 h-5 text-purple-600 mr-3 mt-1 shrink-0" />
                  <span>शाळेचा परिसर स्वच्छ, सुंदर आणि सुरक्षित ठेवणे.</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Principal's Message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-linear-to-r from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg mb-20 border border-amber-200"
          >
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-linear-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-6">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">मुख्याध्यापकांचे मनोगत</h3>
                <p className="text-gray-600 mt-2">- मुख्याध्यापक, जि. प. प्राथमिक शाळा, जावळी</p>
              </div>
            </div>
            
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-amber-400 to-orange-400 rounded-full"></div>
              <div className="space-y-6 text-gray-800 text-lg">
                <p className="text-2xl font-semibold text-amber-700 mb-6">
                  "शिक्षण हे मानवाच्या विकासाचे मूळ आहे."
                </p>
                <p>
                  आमच्या शाळेत येणारे प्रत्येक मूल हे एका बीजाप्रमाणे आहे, ज्याचे रूपांतर एका वटवृक्षात करण्याचे काम आम्ही करतो.
                </p>
                <p>
                  जि. प. प्राथमिक शाळा, जावळी मध्ये आम्ही विद्यार्थ्यांच्या सुप्त गुणांना वाव देतो. आमचे प्रशिक्षित शिक्षक मुलांच्या प्रगतीसाठी सतत प्रयत्नशील असतात. पालकांचे सहकार्य आणि शिक्षकांचे मार्गदर्शन यामुळेच आमची शाळा यशाच्या शिखरावर आहे.
                </p>
                <p className="text-xl font-medium text-amber-700">
                  चला, आपण सर्व मिळून आपल्या मुलांचे भविष्य उज्ज्वल करूया!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">आमची वैशिष्ट्ये</h2>
              <p className="text-xl text-gray-600">आमची शाळा का निवडावी?</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mr-4`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">{feature.title}</h4>
                  </div>
                  <p className="text-gray-700">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-linear-to-r from-green-50 to-emerald-100 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-6">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900">आमची कामगिरी</h3>
                <p className="text-gray-600 mt-2">गौरवाचे क्षण</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-md"
                >
                  <div className="w-14 h-14 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <achievement.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">{achievement.title}</h4>
                  <p className="text-gray-700">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Closing Message */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-20 pt-10 border-t border-gray-200"
          >
            <HeartIcon className="w-16 h-16 text-red-500 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              चला, एकत्र येऊन शिक्षणाचे हे सुंदर प्रवास सुरू करूया!
            </h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              जि. प. प्राथमिक शाळा, जावळी - ज्ञानाचे देवालय, भविष्याचे निर्माते
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    icon: ComputerDesktopIcon,
    title: "डिजिटल क्लासरूम",
    description: "प्रोजेक्टर आणि ई-लर्निंग सॉफ्टवेअरच्या मदतीने शिकण्याची सोय.",
    color: "bg-blue-500"
  },
  {
    icon: AcademicCapIcon,
    title: "अनुभवी शिक्षकवृंद",
    description: "उच्च शिक्षित आणि मुलांवर मनापासून प्रेम करणारे प्रशिक्षित शिक्षक.",
    color: "bg-purple-500"
  },
  {
    icon: BookOpenIcon,
    title: "शिष्यवृत्ती परीक्षा मार्गदर्शन",
    description: "इयत्ता ५ वी व ८ वी शिष्यवृत्ती परीक्षेसाठी विशेष तयारी.",
    color: "bg-amber-500"
  },
  {
    icon: TrophyIcon,
    title: "भव्य क्रीडांगण",
    description: "मुलांच्या शारीरिक विकासासाठी खेळाचे मैदान आणि क्रीडा साहित्य.",
    color: "bg-green-500"
  },
  {
    icon: BuildingLibraryIcon,
    title: "ग्रंथालय",
    description: "मुलांमध्ये वाचनाची आवड निर्माण करण्यासाठी विविध पुस्तकांचा संग्रह.",
    color: "bg-red-500"
  },
  {
    icon: ShieldCheckIcon,
    title: "शासकीय सुविधा",
    description: "मोफत पाठ्यपुस्तके, गणवेश आणि सकस पोषण आहार.",
    color: "bg-indigo-500"
  }
]

const achievements = [
  {
    icon: ChartBarIcon,
    title: "शाळेचा १००% निकाल",
    description: "प्रत्येक वर्षी उत्तम परीक्षा परिणाम"
  },
  {
    icon: AcademicCapIcon,
    title: "शिष्यवृत्ती यश",
    description: "शिष्यवृत्ती परीक्षेत विद्यार्थ्यांचे घवघवीत यश"
  },
  {
    icon: TrophyIcon,
    title: "क्रीडा स्पर्धा",
    description: "तालुका व जिल्हास्तरीय क्रीडा स्पर्धांमध्ये बक्षिसे"
  },
  {
    icon: StarIcon,
    title: "'सुंदर शाळा' उपक्रम",
    description: "विशेष उल्लेखनीय कामगिरी"
  }
]