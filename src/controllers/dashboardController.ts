import { Request, ResponseToolkit } from "@hapi/hapi";
import { AppDataSource } from "../config/database";
import { User, LeaveRequest, LeaveRequestStatus, Holiday } from "../models";
import { getCurrentYear } from "../utils/dateUtils";
import logger from "../utils/logger";
import { In, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

export const getManagerDashboard = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    const managerId = request.auth.credentials.id;

    // Get all users managed by this manager
    const userRepository = AppDataSource.getRepository(User);
    const managedUsers = await userRepository.find({ where: { managerId: managerId as string } });

    if (managedUsers.length === 0) {
      return h
        .response({
          pendingRequests: [],
          pendingCount: 0,
          approvedRequests: [],
          approvedCount: 0,
          teamAvailability: [],
          upcomingHolidays: [],
        })
        .code(200);
    }

    const managedUserIds = managedUsers.map((user) => user.id);

    // Get pending leave requests
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);
    const pendingRequests = await leaveRequestRepository.find({
      where: {
        userId: In(managedUserIds),
        status: LeaveRequestStatus.PENDING,
      },
      relations: ["user", "leaveType"],
      order: {
        createdAt: "DESC",
      },
      take: 5,
    });

    // Get approved leave requests for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const approvedRequests = await leaveRequestRepository.find({
      where: {
        userId: In(managedUserIds),
        status: LeaveRequestStatus.APPROVED,
        startDate: MoreThanOrEqual(startOfMonth),
        endDate: LessThanOrEqual(endOfMonth),
      },
      relations: ["user", "leaveType"],
      order: {
        startDate: "ASC",
      },
    });

    // Calculate team availability for the next 7 days
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const upcomingLeaves = await leaveRequestRepository.find({
      where: {
        userId: In(managedUserIds),
        status: LeaveRequestStatus.APPROVED,
        startDate: LessThanOrEqual(nextWeek),
        endDate: MoreThanOrEqual(today),
      },
      relations: ["user"],
    });

    // Get upcoming holidays
    const holidayRepository = AppDataSource.getRepository(Holiday);
    const upcomingHolidays = await holidayRepository.find({
      where: {
        date: Between(today, nextWeek),
        isActive: true,
      },
      order: {
        date: "ASC",
      },
    });

    // Calculate team availability
    const teamAvailability = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const formattedDate = formatDate(date);

      // Check if it's a weekend
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Check if it's a holiday
      const isHoliday = upcomingHolidays.some((holiday) => {
        const holidayDate = new Date(holiday.date);
        holidayDate.setHours(0, 0, 0, 0);
        return holidayDate.getTime() === date.getTime();
      });

      // Get users on leave for this date
      const usersOnLeave = upcomingLeaves
        .filter((leave) => {
          const startDate = new Date(leave.startDate);
          const endDate = new Date(leave.endDate);
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);
          return date >= startDate && date <= endDate;
        })
        .map((leave) => ({
          id: leave.userId,
          name: `${leave.user.firstName} ${leave.user.lastName}`,
        }));

      // Calculate available users
      const availableUsers = managedUsers
        .filter(
          (user) => !usersOnLeave.some((leaveUser) => leaveUser.id === user.id)
        )
        .map((user) => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
        }));

      teamAvailability.push({
        date: formattedDate,
        isWeekend,
        isHoliday,
        totalUsers: managedUsers.length,
        availableUsers,
        availableCount: availableUsers.length,
        usersOnLeave,
        onLeaveCount: usersOnLeave.length,
      });
    }

    // Count pending requests
    const pendingCount = await leaveRequestRepository.count({
      where: {
        userId: In(managedUserIds),
        status: LeaveRequestStatus.PENDING,
      },
    });

    return h
      .response({
        pendingRequests,
        pendingCount,
        approvedRequests,
        approvedCount: approvedRequests.length,
        teamAvailability,
        upcomingHolidays,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getManagerDashboard: ${error}`);
    return h
      .response({ message: "An error occurred while fetching dashboard data" })
      .code(500);
  }
};

export const getEmployeeDashboard = async (
  request: Request,
  h: ResponseToolkit
) => {
  try {
    const userId = request.auth.credentials.id;

    // Get user's leave requests
    const leaveRequestRepository = AppDataSource.getRepository(LeaveRequest);

    // Get pending leave requests
    const pendingRequests = await leaveRequestRepository.find({
      where: {
        userId: userId as string,
        status: LeaveRequestStatus.PENDING,
      },
      relations: ["leaveType"],
      order: {
        createdAt: "DESC",
      },
    });

    // Get upcoming approved leave requests
    const today = new Date();
    const upcomingRequests = await leaveRequestRepository.find({
      where: {
        userId: userId as string,
        status: LeaveRequestStatus.APPROVED,
        startDate: MoreThanOrEqual(today),
      },
      relations: ["leaveType"],
      order: {
        startDate: "ASC",
      },
      take: 5,
    });

    // Get recent leave history
    const recentHistory = await leaveRequestRepository.find({
      where: {
        userId: userId as string,
        endDate: LessThanOrEqual(today),
      },
      relations: ["leaveType"],
      order: {
        endDate: "DESC",
      },
      take: 5,
    });

    // Get upcoming holidays
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const holidayRepository = AppDataSource.getRepository(Holiday);
    const upcomingHolidays = await holidayRepository.find({
      where: {
        date: Between(today, nextMonth),
        isActive: true,
      },
      order: {
        date: "ASC",
      },
    });

    // Get leave statistics for the current year
    const currentYear = getCurrentYear();
    const leaveStatistics = await AppDataSource.query(
      `
      SELECT 
        lt.name as leaveType,
        lb.balance,
        lb.used,
        lb.carryForward,
        (lb.balance + lb.carryForward - lb.used) as remaining
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leaveTypeId = lt.id
      WHERE lb.userId = $1 AND lb.year = $2
    `,
      [userId, currentYear]
    );

    return h
      .response({
        pendingRequests,
        pendingCount: pendingRequests.length,
        upcomingRequests,
        recentHistory,
        upcomingHolidays,
        leaveStatistics,
      })
      .code(200);
  } catch (error) {
    logger.error(`Error in getEmployeeDashboard: ${error}`);
    return h
      .response({ message: "An error occurred while fetching dashboard data" })
      .code(500);
  }
};

// Helper functions
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}
