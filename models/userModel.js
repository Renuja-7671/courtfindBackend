const prisma = require('../prisma/client');

const User = {
    // Find user by email - converted from callback to async/await
    findByEmail: async (email) => {
        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },

    // Create new user - converted from callback to async/await
    createUser: async (userData) => {
        try {
            const user = await prisma.user.create({
                data: {
                    role: userData[0],
                    firstName: userData[1],
                    lastName: userData[2],
                    mobile: userData[3],
                    country: userData[4],
                    province: userData[5],
                    zip: userData[6],
                    address: userData[7],
                    email: userData[8],
                    password: userData[9]
                }
            });
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Alternative createUser method with object parameter (more intuitive)
    createUserObject: async (userData) => {
        try {
            const user = await prisma.user.create({
                data: {
                    role: userData.role,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    mobile: userData.mobile,
                    country: userData.country,
                    province: userData.province,
                    zip: userData.zip,
                    address: userData.address,
                    email: userData.email,
                    password: userData.password,
                    profileImage: userData.profileImage || null
                }
            });
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user with reset token - converted from callback to async/await
    updateUser: async (data) => {
        try {
            const user = await prisma.user.update({
                where: { email: data[2] },
                data: {
                    resetToken: data[0],
                    resetTokenExpires: data[1]
                }
            });
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Alternative updateUser method with object parameter
    updateUserByEmail: async (email, resetToken, resetTokenExpires) => {
        try {
            const user = await prisma.user.update({
                where: { email },
                data: {
                    resetToken,
                    resetTokenExpires
                }
            });
            return user;
        } catch (error) {
            console.error('Error updating user by email:', error);
            throw error;
        }
    },

    // Get all users with valid reset tokens - converted to use Prisma date handling
    getUsersWithValidResetToken: async () => {
        try {
            const currentTime = new Date();
            const users = await prisma.user.findMany({
                where: {
                    AND: [
                        { resetToken: { not: null } },
                        { resetTokenExpires: { gt: currentTime.toISOString() } }
                    ]
                }
            });
            return users;
        } catch (error) {
            console.error('Error getting users with valid reset tokens:', error);
            throw error;
        }
    },

    // Update user password and remove reset token - converted from callback
    updateUserPassword: async (userId, hashedPassword) => {
        try {
            if (!userId || !hashedPassword) {
                console.error("updateUserPassword Error: Missing parameters", { userId, hashedPassword });
                throw new Error("User ID or Password is undefined");
            }

            const user = await prisma.user.update({
                where: { userId: parseInt(userId) },
                data: {
                    password: hashedPassword,
                    resetToken: null,
                    resetTokenExpires: null
                }
            });
            return user;
        } catch (error) {
            console.error('Error updating user password:', error);
            throw error;
        }
    },

    // Get owner profile - converted with select for specific fields
    getOwnerProfile: async (ownerId) => {
        try {
            const owner = await prisma.user.findUnique({
                where: { userId: parseInt(ownerId) },
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    mobile: true,
                    country: true,
                    province: true,
                    zip: true,
                    address: true
                }
            });
            return owner;
        } catch (error) {
            console.error('Error getting owner profile:', error);
            throw error;
        }
    },

    // Update owner profile - converted from callback
    updateOwnerProfile: async (ownerId, profileData) => {
        try {
            const { firstName, lastName, mobile, country, province, zip, address } = profileData;
            const updatedOwner = await prisma.user.update({
                where: { userId: parseInt(ownerId) },
                data: {
                    firstName,
                    lastName,
                    mobile,
                    country,
                    province,
                    zip,
                    address
                }
            });
            return updatedOwner;
        } catch (error) {
            console.error('Error updating owner profile:', error);
            throw error;
        }
    },

    // Update profile image - already async, just converted to Prisma
    updateProfileImage: async (userId, imageUrl) => {
        try {
            const user = await prisma.user.update({
                where: { userId: parseInt(userId) },
                data: { profileImage: imageUrl }
            });
            return { message: "Profile image updated successfully", user };
        } catch (error) {
            console.error('Error updating profile image:', error);
            throw error;
        }
    },

    // Get profile image - converted from callback
    getProfileImage: async (userId) => {
        try {
            const user = await prisma.user.findUnique({
                where: { userId: parseInt(userId) },
                select: { profileImage: true }
            });
            return user;
        } catch (error) {
            console.error('Error getting profile image:', error);
            throw error;
        }
    },

    // Additional helper methods that might be useful

    // Find user by ID
    findById: async (userId) => {
        try {
            const user = await prisma.user.findUnique({
                where: { userId: parseInt(userId) }
            });
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    },

    // Get all users (for admin purposes)
    getAllUsers: async () => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    mobile: true,
                    country: true,
                    createdAt: true
                }
            });
            return users;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            const user = await prisma.user.delete({
                where: { userId: parseInt(userId) }
            });
            return user;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Count total users
    countUsers: async () => {
        try {
            const count = await prisma.user.count();
            return count;
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }
};

module.exports = User;