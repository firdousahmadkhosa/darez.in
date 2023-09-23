// const body = {
// //   question: {
// //     q_title:
// //       "Have you ever sent an inappropriate text to your mom or dad by accident?",
// //     q_ctitle: "",
// //     q_status: 1,
// //   },
//   Options: [{ a_text: "yes" }, { a_text: "yes" }],
// };

// console.log(JSON.stringify(body.Options));

//  const body= {
//    'options[31][a_text]': 'Yescvvv',
//    'options[31][a_thumb]': '/img1694848583021313333828_584268356808963_772710849526903833_n.jpg',
//    'options[32][a_text]': 'Nodsdf',
//    'options[32][a_thumb]': 'IMG_5d5a87ffefb10.jpg',
//    'options[33][a_text]': 'Nodfsdfsdsdf',
//    'options[33][a_thumb]': 'IMG_5d5afdsfsd87ffefb10.jpg'
//  }

//  const files = {
//    'options[31][a_image]': {
//      name: 'Hat (2).jpg',
//      data: `<Buffer ff d8 ff e1 00 18 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 00 00 00 00 00 00 00 00 ff ec 00 11 44 75 63 6b 79 00 01 00 04 00 00 00 28 00 00 ff e1 03 ... 9704 more bytes>`,
//      size: 9754,
//      encoding: '7bit',
//      tempFilePath: '',
//      truncated: false,
//      mimetype: 'image/jpeg',
//      md5: '8451af480e58bf6ae344d08189eeb22e',
//      mv: [Function: mv]
//    },
//    'options[32][a_image]': {
//      name: 'Hat (3).jpg',
//      data: `<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 01 00 01 00 00 ff fe 00 3b 43 52 45 41 54 4f 52 3a 20 67 64 2d 6a 70 65 67 20 76 31 2e 30 20 28 75 73 69 ... 84785 more bytes>`,
//      size: 84835,
//      encoding: '7bit',
//      tempFilePath: '',
//      truncated: false,
//      mimetype: 'image/jpeg',
//      md5: '4e4d332bd9a1dc270aa6ac152a3b346d',
//      mv: [Function: mv]
//    }
//  }

const body = {
  "options[177][a_text]": "this is new answers",
  "options[177][a_thumb]": "/img1695457881769logo-crunos-color.png",
  userId: 1,
};

const thumbValue = body["options[177][a_thumb]"];
console.log(thumbValue);