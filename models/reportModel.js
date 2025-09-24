const prisma = require('../prisma/client');

exports.getArenaRevenues = async (ownerId) => {
  try {
    const currentYear = new Date().getFullYear();
    
    const revenues = await prisma.payment.groupBy({
      by: ['arenaId'],
      where: {
        ownerId: parseInt(ownerId),
        playerId: { not: null },
        paidAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      _sum: {
        amount: true
      }
    });

    // Get arena names for each group
    const results = await Promise.all(
      revenues.map(async (revenue) => {
        const arena = await prisma.arena.findUnique({
          where: { arenaId: revenue.arenaId },
          select: { name: true }
        });
        
        return {
          name: arena.name,
          total: revenue._sum.amount
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error getting arena revenues:', error);
    throw error;
  }
};

exports.getMostBookedCourts = async (ownerId) => {
  try {
    const courtBookings = await prisma.booking.groupBy({
      by: ['courtId'],
      where: {
        arena: {
          ownerId: parseInt(ownerId)
        }
      },
      _count: {
        bookingId: true
      },
      orderBy: {
        _count: {
          bookingId: 'desc'
        }
      },
      take: 5
    });

    // Get court and arena names for each group
    const results = await Promise.all(
      courtBookings.map(async (booking) => {
        const court = await prisma.court.findUnique({
          where: { courtId: booking.courtId },
          select: {
            name: true,
            arena: {
              select: { name: true }
            }
          }
        });
        
        return {
          courtName: court.name,
          arenaName: court.arena.name,
          bookingsCount: booking._count.bookingId
        };
      })
    );

    return results;
  } catch (error) {
    console.error('Error getting most booked courts:', error);
    throw error;
  }
};