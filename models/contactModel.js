const prisma = require('../prisma/client');

const Contact = {
    createMessage: async (data) => {
        try {
            const newMessage = await prisma.contactMessage.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    message: data.message
                }
            });

            return newMessage;
        } catch (error) {
            console.error('Error creating contact message:', error);
            throw error;
        }
    },

    receiveMessages: async () => {
        try {
            const messages = await prisma.contactMessage.findMany({
                select: {
                    id: true,
                    name: true,
                    message: true,
                    email: true,
                    phone: true,
                    status: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Transform to match original structure
            return messages.map(message => ({
                id: message.id,
                name: message.name,
                message: message.message,
                email: message.email,
                phone: message.phone,
                status: message.status,
                created_at: message.createdAt
            }));
        } catch (error) {
            console.error('Error receiving contact messages:', error);
            throw error;
        }
    },

    updateMessageStatus: async (id, status) => {
        try {
            const updatedMessage = await prisma.contactMessage.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    status: status
                }
            });

            return updatedMessage;
        } catch (error) {
            console.error('Error updating message status:', error);
            throw error;
        }
    }
};

module.exports = Contact;