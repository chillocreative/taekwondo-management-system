# 🥋 Taekwondo Management System

<div align="center">

![Taekwondo A&Z](https://img.shields.io/badge/Taekwondo-A%26Z-gold?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Inertia.js](https://img.shields.io/badge/Inertia.js-1.0-9553E9?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-featured management system for Taekwondo training centers**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

Taekwondo Management System is a comprehensive web application designed to streamline the administration of Taekwondo training centers. Built with Laravel and React, it provides an intuitive interface for managing students, tracking payments, scheduling classes, and handling administrative tasks.

## ✨ Features

### 👥 Student Management
- **Complete Student Profiles** - Store detailed information including personal details, emergency contacts, and training history
- **Belt Progression Tracking** - Monitor student advancement through belt ranks
- **Attendance Management** - Track class attendance and participation
- **Parent/Guardian Information** - Manage family connections and emergency contacts

### 💰 Payment Processing
- **Fee Management** - Handle monthly fees, registration fees, and special event payments
- **ToyyibPay Integration** - Secure online payment gateway (sandbox & production modes)
- **Payment History** - Comprehensive transaction records and receipts
- **Automated Reminders** - Payment due notifications
- **PDF Receipts** - Generate and download payment summaries

### 🏫 Training Center Management
- **Multi-Center Support** - Manage multiple training locations
- **Class Scheduling** - Create and manage class timetables
- **Instructor Assignment** - Assign instructors to classes and students
- **Facility Management** - Track equipment and facility resources

### 📊 Administrative Features
- **User Role Management** - Admin, instructor, and parent access levels
- **Dashboard Analytics** - Real-time insights and statistics
- **Report Generation** - Custom reports for students, payments, and attendance
- **Settings Configuration** - Flexible system settings and payment gateway configuration

### 🔐 Security & Authentication
- **Secure Login System** - Laravel Breeze authentication
- **Role-Based Access Control** - Granular permissions system
- **Password Recovery** - Email-based password reset
- **Session Management** - Secure session handling

## 🛠 Tech Stack

### Backend
- **Laravel 11** - Modern PHP framework
- **MySQL** - Relational database
- **Laravel Breeze** - Authentication scaffolding
- **DomPDF** - PDF generation

### Frontend
- **React 18** - UI library
- **Inertia.js** - Modern monolith architecture
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool
- **React DatePicker** - Enhanced date selection

### Additional Tools
- **Composer** - PHP dependency management
- **NPM** - JavaScript package management
- **Git** - Version control

## 📦 Installation

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js >= 18.x
- MySQL >= 8.0
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/chillocreative/taekwondo-management-system.git
cd taekwondo-management-system
```

### Step 2: Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### Step 3: Environment Configuration
```bash
# Copy the example environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup
Edit your `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=taekwondo
DB_USERNAME=root
DB_PASSWORD=your_password
```

Then run migrations and seeders:
```bash
# Run database migrations
php artisan migrate

# Seed the database with sample data
php artisan db:seed
```

### Step 5: Storage Setup
```bash
# Create symbolic link for storage
php artisan storage:link
```

### Step 6: Build Assets
```bash
# Development
npm run dev

# Production
npm run build
```

### Step 7: Start the Application
```bash
# Start Laravel development server
php artisan serve

# In a separate terminal, start Vite (for development)
npm run dev
```

Visit `http://localhost:8000` in your browser.

## 🔑 Default Login Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@taekwondo.com`
- Password: `password`

**Instructor Account:**
- Email: `instructor@taekwondo.com`
- Password: `password`

> ⚠️ **Important:** Change these passwords immediately in production!

## 🚀 Usage

### For Administrators
1. **Dashboard** - View system overview and statistics
2. **Students** - Add, edit, and manage student records
3. **Payments** - Process payments and view transaction history
4. **Training Centers** - Manage multiple locations
5. **Settings** - Configure payment gateway and system settings

### For Instructors
1. **View Students** - Access student information and progress
2. **Mark Attendance** - Track class participation
3. **Update Progress** - Record belt advancements and achievements

### For Parents/Guardians
1. **View Children** - Access child's profile and progress
2. **Make Payments** - Pay fees online securely
3. **View History** - Check payment and attendance records

## 📱 Mobile Responsive

The system is fully responsive and works seamlessly on:
- 📱 Mobile devices (iOS & Android)
- 📱 Tablets
- 💻 Desktop computers

## 🔧 Configuration

### Payment Gateway Setup
1. Navigate to **Settings > Payment**
2. Enter your ToyyibPay credentials:
   - Secret Key
   - Category Code
3. Toggle between Sandbox/Production mode
4. Save settings

### Email Configuration
Update your `.env` file with SMTP settings:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 📸 Screenshots

> Add screenshots of your application here

## 🧪 Testing

```bash
# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage
```

## 📚 Documentation

For detailed documentation, please refer to:
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [API Documentation](docs/api.md) - API endpoints reference
- [User Guide](docs/user-guide.md) - End-user documentation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow PSR-12 for PHP code
- Use ESLint for JavaScript/React code
- Write meaningful commit messages
- Add tests for new features

## 🐛 Bug Reports

If you discover a bug, please create an issue on GitHub with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, PHP version, etc.)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Chillo Creative**
- GitHub: [@chillocreative](https://github.com/chillocreative)
- Repository: [taekwondo-management-system](https://github.com/chillocreative/taekwondo-management-system)

## 🙏 Acknowledgments

- Laravel Team for the amazing framework
- React Team for the powerful UI library
- Inertia.js for seamless SPA experience
- ToyyibPay for payment gateway integration
- All contributors and supporters

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@taekwondo.com
- Documentation: [Wiki](https://github.com/chillocreative/taekwondo-management-system/wiki)

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] SMS notifications
- [ ] Online class booking
- [ ] Video lesson integration
- [ ] Multi-language support
- [ ] Automated belt testing scheduling
- [ ] Competition management module

---

<div align="center">

**Made with ❤️ for the Taekwondo community**

⭐ Star this repository if you find it helpful!

</div>
