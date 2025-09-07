import {BadRequestError, IBuyerDocument, IEducation, IExperience, ISellerDocument} from "@kariru-k/gigconnect-shared";
import {faker} from "@faker-js/faker/locale/en";
import {NextFunction, Request, Response} from "express";
import {getRandomBuyers} from "../../services/buyer.service";
import {createSeller, getSellerByEmail} from "../../services/seller.service";
import {v4 as uuidv4} from "uuid";
import {StatusCodes} from "http-status-codes";

export const seedSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { count } = req.params;
        const buyers: IBuyerDocument[] = await getRandomBuyers(parseInt(count, 10));

        for (const element of buyers) {
            const buyer: IBuyerDocument = element;
            const checkIfSellerExists: ISellerDocument | null = await getSellerByEmail(buyer.email!);
            if (checkIfSellerExists) {
                throw new BadRequestError(`Seller with email ${buyer.email} already exists`, 'Seller seed');
            } else {
                const basicDescription = faker.commerce.productDescription();
                const skills: string[] = ['Programming', 'Web Development', 'Graphic Design', 'Digital Marketing', 'SEO', 'Content Writing', 'Project Management', 'Data Analysis', 'Customer Service', 'Sales'];
                const seller: ISellerDocument = {
                    profilePublicId: uuidv4(),
                    fullName: faker.person.fullName(),
                    username: buyer.username!,
                    email: buyer.email!,
                    profilePicture: buyer.profilePicture!,
                    description: basicDescription.length <= 250 ? basicDescription : basicDescription.slice(0, 250),
                    country: faker.location.country(),
                    oneliner: faker.company.catchPhrase().slice(0, 60),
                    skills: faker.helpers.arrayElements(skills, Math.floor(Math.random() * skills.length)),
                    languages: [
                        {'language': 'English', 'level': 'Fluent'},
                        {'language': 'Spanish', 'level': 'Basic'},
                        {'language': 'French', 'level': 'Conversational'},
                    ],
                    responseTime: parseInt(faker.commerce.price({ min: 1, max: 5, dec: 0 })),
                    experience: randomExperiences(Math.floor(Math.random() * 5) + 1),
                    education: randomEducation(Math.floor(Math.random() * 3) + 1),
                    socialLinks: [
                        'https://www.facebook.com/' + buyer.username,
                        'https://www.twitter.com/' + buyer.username,
                        'https://www.linkedin.com/in/' + buyer.username
                    ],
                    certificates: [
                        {
                            name: 'Certified ' + faker.person.jobTitle(),
                            from: faker.company.name(),
                            year: faker.date.past({ years: 10 }).getFullYear()
                        },
                        {
                            name: 'Advanced ' + faker.person.jobTitle(),
                            from: faker.company.name(),
                            year: faker.date.past({ years: 10 }).getFullYear()
                        },
                        {
                            name: 'Professional ' + faker.person.jobTitle(),
                            from: faker.company.name(),
                            year: faker.date.past({ years: 10 }).getFullYear()
                        }
                    ],
                }

                await createSeller(seller);
            }

            res.status(StatusCodes.CREATED).json({
                message: 'Sellers created successfully'
            });
        }

    } catch (e) {
        next(e);
    }
}


const randomExperiences = (count: number): IExperience[] => {
    const result: IExperience[] = [];

    for (let i = 0; i < count; i++) {
        const randomStartYear = [2020, 2021, 2022, 2023, 2024, 2025];
        const randomEndYear = [2020, 2021, 2022, 2023, 2024, 2025, 'Present'];
        const endYear = randomEndYear[Math.floor(Math.random() * randomEndYear.length)];

        const experience: IExperience = {
            company: faker.company.name(),
            title: faker.person.jobTitle(),
            startDate: `${faker.date.month()} ${randomStartYear[Math.floor(Math.random() * randomStartYear.length)]}`,
            endDate: endYear === 'Present' ? 'Present' : `${faker.date.month()} ${endYear}`,
            description: faker.commerce.productDescription().slice(0, 100),
            currentlyWorkingHere: endYear === 'Present'
        }

        result.push(experience);
    }

    return result;
}

const randomEducation = (count: number): IEducation[] => {
    const result: IEducation[] = [];

    for (let i = 0; i < count; i++) {
        const randomYear = [2020, 2021, 2022, 2023, 2024, 2025];

        const education: IEducation = {
            country: faker.location.country(),
            university: faker.company.name(),
            title: faker.person.jobTitle(),
            major: `${faker.person.jobArea()} ${faker.person.jobDescriptor()} `,
            year: `${randomYear[Math.floor(Math.random() * randomYear.length)]}`,
        }

        result.push(education);
    }

    return result;
}
