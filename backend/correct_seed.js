
const bcrypt = require('bcryptjs');
const { sequelize, User, Driver, Parent } = require('./src/db');

// This is a simplified user creation function that correctly hashes passwords.
// It is based on the logic found in the rest of the application.
async function createUser(userData, transaction) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    return User.create({
        ...userData,
        password: hashedPassword,
    }, { transaction });
}

async function seed() {
    const t = await sequelize.transaction();
    try {
        console.log('Starting database seed...');

        // Create Users with HASHED passwords
        console.log('Creating users...');
        const admin1 = await createUser({
            id: 'U001',
            username: 'admin1',
            password: '123456',
            email: 'admin@school.com',
            role: 'admin'
        }, t);

        const driver1 = await createUser({
            id: 'U002',
            username: 'driver1',
            password: '123456',
            email: 'driver1@school.com',
            role: 'driver'
        }, t);

        const parent1 = await createUser({
            id: 'U005',
            username: 'parent1',
            password: '123456',
            email: 'parent1@gmail.com',
            role: 'parent'
        }, t);

        console.log('Users created.');

        // Create corresponding Driver/Parent profiles
        console.log('Creating profiles...');
        await Driver.create({
            id: 'D001',
            full_name: 'Nguyễn Văn A',
            license_number: 'GPLX001',
            phone: '0901234567',
            user_id: driver1.id
        }, { transaction: t });

        await Parent.create({
            id: 'P001',
            full_name: 'Trần Thị B',
            phone: '0907654321',
            address: '123 Nguyễn Trãi',
            user_id: parent1.id
        }, { transaction: t });

        console.log('Profiles created.');

        // Commit the transaction
        await t.commit();
        console.log('SUCCESS: Database has been seeded correctly!');
        console.log('You can now log in with username 'admin1' or 'driver1' and password '123456'.');

    } catch (error) {
        // Rollback in case of error
        await t.rollback();
        console.error('ERROR: Could not seed database:', error);
    } finally {
        await sequelize.close();
    }
}

// Connect to DB and run the seed function
db.connectDB().then(() => {
    seed();
});
