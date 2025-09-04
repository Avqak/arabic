// Email Service for Admin Approval Notifications
class EmailService {
    constructor() {
        this.websiteEmail = 'Zezo0509677841@gmail.com'; // Website's email address
    }

    // Send admin approval request notification to website email
    sendAdminRequestNotification(adminRequest) {
        const subject = 'طلب حساب إداري جديد';
        const body = `
            تم استلام طلب حساب إداري جديد:
            
            الاسم: ${adminRequest.firstName} ${adminRequest.lastName}
            البريد الإلكتروني: ${adminRequest.email}
            رقم الهاتف: ${adminRequest.phone}
            المنصب: ${adminRequest.position}
            سبب الطلب: ${adminRequest.reason}
            تاريخ الطلب: ${new Date(adminRequest.requestDate).toLocaleDateString('ar-SA')}
            
            للرد على هذا الطلب، يرجى تسجيل الدخول إلى لوحة الإدارة.
        `;

        // In a real application, this would send an actual email
        // For now, we'll store it in localStorage for demonstration
        this.storeEmailNotification(subject, body, adminRequest.email);
        
        console.log('Admin request notification sent:', { subject, body });
        return true;
    }

    // Send approval/rejection notification to user
    sendApprovalNotification(userEmail, approved, reason = '') {
        const subject = approved ? 'تم قبول طلب الحساب الإداري' : 'تم رفض طلب الحساب الإداري';
        const body = approved ? `
            مرحباً،
            
            تم قبول طلبك للحصول على حساب إداري.
            
            يمكنك الآن تسجيل الدخول باستخدام:
            البريد الإلكتروني: ${userEmail}
            كلمة المرور الافتراضية: admin123
            
            يرجى تغيير كلمة المرور بعد تسجيل الدخول الأول.
            
            شكراً لك.
        ` : `
            مرحباً،
            
            نعتذر، تم رفض طلبك للحصول على حساب إداري.
            ${reason ? `السبب: ${reason}` : ''}
            
            إذا كان لديك أي استفسارات، يرجى التواصل معنا.
            
            شكراً لك.
        `;

        this.storeEmailNotification(subject, body, userEmail);
        
        console.log('Approval notification sent:', { subject, body });
        return true;
    }

    // Store email notification in localStorage (for demonstration)
    storeEmailNotification(subject, body, recipient) {
        const notifications = JSON.parse(localStorage.getItem('emailNotifications')) || [];
        notifications.push({
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            subject: subject,
            body: body,
            recipient: recipient,
            sentAt: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('emailNotifications', JSON.stringify(notifications));
    }

    // Get all email notifications
    getEmailNotifications() {
        return JSON.parse(localStorage.getItem('emailNotifications')) || [];
    }

    // Mark notification as read
    markAsRead(notificationId) {
        const notifications = this.getEmailNotifications();
        const notificationIndex = notifications.findIndex(n => n.id === notificationId);
        
        if (notificationIndex !== -1) {
            notifications[notificationIndex].read = true;
            localStorage.setItem('emailNotifications', JSON.stringify(notifications));
        }
    }

    // Get unread notifications count
    getUnreadCount() {
        const notifications = this.getEmailNotifications();
        return notifications.filter(n => !n.read).length;
    }

    // Simulate sending email (in real app, this would use a service like SendGrid, Mailgun, etc.)
    async sendEmail(to, subject, body) {
        // This is a simulation - in a real application, you would:
        // 1. Use a service like SendGrid, Mailgun, or AWS SES
        // 2. Configure SMTP settings
        // 3. Handle email delivery status
        
        console.log('Sending email:', { to, subject, body });
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store in localStorage for demonstration
        this.storeEmailNotification(subject, body, to);
        
        return true;
    }
}

// Initialize email service
const emailService = new EmailService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
} 