interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    cc?: string | string[];
    bcc?: string | string[];
}
declare class EmailService {
    private transporter;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendLeaveRequestNotification(managerEmail: string, employeeName: string, leaveType: string, startDate: string, endDate: string, reason: string): Promise<boolean>;
    sendLeaveStatusUpdateNotification(employeeEmail: string, leaveType: string, startDate: string, endDate: string, status: string, comments?: string): Promise<boolean>;
    sendLeaveBalanceUpdateNotification(employeeEmail: string, leaveType: string, newBalance: number): Promise<boolean>;
    sendLeavePolicyUpdateNotification(employeeEmails: string[], policyName: string, changes: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
