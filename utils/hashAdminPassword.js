const bcrypt = require("bcryptjs");

const hashPassword = async () => {
    const plainPassword = "adminpwd"; // Your admin password
    const saltRounds = 10;

    try {
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        console.log("Hashed Password:", hashedPassword);
    } catch (error) {
        console.error("Error hashing password:", error);
    }
};

hashPassword();
