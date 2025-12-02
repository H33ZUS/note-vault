const User = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

async function bootstrapAdmin() {
    try {
        const adminExists = await User.findOne({ roles: "admin" });

        if (adminExists) {
            console.log("Admin account already exists. Skipping bootstrap");
            return;
        }

        const username = "initial_admin";
        const email = "admin@example.com";

        const rawPassword = crypto.randomBytes(12).toString("hex");
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);  

        const adminUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            roles: ["admin", "teacher"]
        });

        await adminUser.save();

        console.log("\n======================================================");
        console.log("    🔑 INITIAL ADMIN ACCOUNT CREATED SUCCESSFULLY 🔑");
        console.log(`\nUSERNAME: ${username}`);
        console.log(`PASSWORD: ${rawPassword}`);
        console.log("\n*** This is the password for your temporary admin account. ***");
        console.log("======================================================\n");
    } catch (err) {
        console.err("ERROR: Failed to bootstrap the initial admin account.", err.message);
    }
}

module.exports = bootstrapAdmin;