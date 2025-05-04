"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
const logger_1 = __importDefault(require("./logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.default.email.host,
            port: config_1.default.email.port,
            secure: config_1.default.email.port === 465,
            auth: {
                user: config_1.default.email.user,
                pass: config_1.default.email.pass,
            },
        });
    }
    async sendEmail(options) {
        try {
            const mailOptions = {
                from: config_1.default.email.from,
                to: options.to,
                cc: options.cc,
                bcc: options.bcc,
                subject: options.subject,
                html: options.html,
            };
            await this.transporter.sendMail(mailOptions);
            logger_1.default.info(`Email sent to ${options.to}`);
            return true;
        }
        catch (error) {
            logger_1.default.error(`Error sending email: ${error}`);
            return false;
        }
    }
    // Email templates for different notifications
    async sendLeaveRequestNotification(managerEmail, employeeName, leaveType, startDate, endDate, reason) {
        const subject = `Leave Request from ${employeeName}`;
        const html = `
      <h2>New Leave Request</h2>
      <p><strong>Employee:</strong> ${employeeName}</p>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>From:</strong> ${startDate}</p>
      <p><strong>To:</strong> ${endDate}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>Please login to the system to approve or reject this request.</p>
    `;
        return this.sendEmail({ to: managerEmail, subject, html });
    }
    async sendLeaveStatusUpdateNotification(employeeEmail, leaveType, startDate, endDate, status, comments) {
        const subject = `Leave Request ${status}`;
        let html = `
      <h2>Leave Request ${status}</h2>
      <p><strong>Leave Type:</strong> ${leaveType}</p>
      <p><strong>From:</strong> ${startDate}</p>
      <p><strong>To:</strong> ${endDate}</p>
      <p><strong>Status:</strong> ${status}</p>
    `;
        if (comments) {
            html += `<p><strong>Comments:</strong> ${comments}</p>`;
        }
        return this.sendEmail({ to: employeeEmail, subject, html });
    }
    async sendLeaveBalanceUpdateNotification(employeeEmail, leaveType, newBalance) {
        const subject = `Leave Balance Update`;
        const html = `
      <h2>Leave Balance Update</h2>
      <p>Your ${leaveType} leave balance has been updated.</p>
      <p><strong>New Balance:</strong> ${newBalance} days</p>
    `;
        return this.sendEmail({ to: employeeEmail, subject, html });
    }
    async sendLeavePolicyUpdateNotification(employeeEmails, policyName, changes) {
        const subject = `Leave Policy Update: ${policyName}`;
        const html = `
      <h2>Leave Policy Update</h2>
      <p>The following changes have been made to the ${policyName} policy:</p>
      <p>${changes}</p>
    `;
        return this.sendEmail({ to: employeeEmails, subject, html });
    }
}
exports.default = new EmailService();
//# sourceMappingURL=emailService.js.map