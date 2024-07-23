import { fakerEN_US as faker } from "@faker-js/faker";

import { GENDERS, USER_ROLES, USER_STATUS } from "../utils/const.util";
import { User } from "../models/user.model";

export default async function creatorSeeder() {
  try {
    await User.deleteMany({ role: USER_ROLES.CREATOR });

    const creators = [];

    for (let i = 1; i <= 40; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;

      const data = {
        role: USER_ROLES.CREATOR,

        name,
        email: faker.internet.email({ firstName, lastName }),
        phone: faker.phone.number(),
        age: faker.number.int({ min: 15, max: 45 }),
        address: [
          faker.location.country(),
          faker.location.state(),
          faker.location.city(),
          faker.location.streetAddress()
        ].join(" "),
        password: faker.internet.password(),
        status: USER_STATUS.ACTIVE,

        qa: [],

        characteristics: [faker.person.bio()],
        subscriptionId: "",

        isStatic: true,
        avatar: `static/creator/image_${i.toString().padStart(2, "0")}.png`,
        gender: GENDERS[faker.number.int({ min: 0, max: 2 })],
        description: faker.lorem.paragraph(),
        cost: faker.commerce.price({ min: 0, max: 50 }),

        items: [faker.internet.emoji()],
        includes: `https://onlyfans.com/${name
          .replace(/ /g, ".")
          .toLowerCase()}`,

        likes: faker.number.int({ min: 100000, max: 999999 }),
        pictures: faker.number.int({ min: 1000, max: 9999 }),
        videos: faker.number.int({ min: 0, max: 999 }),

        shares: {
          twitter: faker.datatype.boolean(),
          instagram: faker.datatype.boolean(),
          tiktok: faker.datatype.boolean()
        }
      };

      creators.push(data);
    }

    await User.insertMany(creators);
    console.log(`${creators.length} creators inserted successfully`);
  } catch (err) {
    console.error("Error reading folder or processing data:", err);
  }
}
