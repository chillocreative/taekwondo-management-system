# Taekwondo Management System - User Levels & Features

## Overview
The system now supports three user levels with specific features for each role.

## User Levels

### 1. Admin
- **Role**: `admin`
- **Access**: Full system administration
- **Features**:
  - Manage Training Centers (Pusat Latihan)
    - Add, edit, delete training centers
    - Set active/inactive status
    - View all registered centers
  - Manage all students
  - View all system data

### 2. Coach (Jurulatih)
- **Role**: `coach`
- **Access**: Training and student management
- **Features**:
  - Manage students
  - View training schedules
  - Track student progress

### 3. User (Parent)
- **Role**: `user` (default for new registrations)
- **Access**: Personal account and children management
- **Features**:
  - Manage multiple children
    - Add child profiles
    - Update child information
    - Track belt levels
    - Set active/inactive status
  - View class schedules
  - Track children's progress

## Database Structure

### New Tables

#### `training_centers`
- `id` - Primary key
- `name` - Training center name
- `address` - Physical address
- `contact_number` - Contact phone number
- `is_active` - Active status (boolean)
- `timestamps`

#### `children`
- `id` - Primary key
- `parent_id` - Foreign key to users table
- `name` - Child's name
- `date_of_birth` - Birth date
- `ic_number` - IC/MyKid number
- `belt_level` - Current belt level (enum)
- `is_active` - Active status
- `timestamps`

### Updated Tables

#### `users`
- Added `role` column (admin/coach/user)
- Added `training_center_id` foreign key

## Belt Levels
The system supports the following belt levels:
- Putih (White)
- Kuning (Yellow)
- Hijau (Green)
- Biru (Blue)
- Merah (Red)
- Hitam 1 Dan (Black 1st Dan)
- Hitam 2 Dan (Black 2nd Dan)
- Hitam 3 Dan (Black 3rd Dan)
- Hitam 4 Dan (Black 4th Dan)
- Hitam 5 Dan (Black 5th Dan)

## Registration Flow

### New User Registration
1. User visits registration page
2. Fills in:
   - Name (Nama)
   - Phone Number (Nombor Telefon) - used as username
   - **Pusat Latihan** - dropdown selection of active training centers
   - Password
   - Password Confirmation
3. User is automatically assigned `user` role
4. User is linked to selected training center

## Routes

### Admin Routes
- `GET /training-centers` - List all training centers
- `POST /training-centers` - Create new training center
- `PUT /training-centers/{id}` - Update training center
- `DELETE /training-centers/{id}` - Delete training center

### Parent Routes
- `GET /children` - List parent's children
- `POST /children` - Add new child
- `PUT /children/{id}` - Update child information
- `DELETE /children/{id}` - Remove child

## Seeded Data

### Training Centers
1. Pusat Latihan A&Z Kepala Batas
2. Pusat Latihan A&Z Butterworth
3. Pusat Latihan A&Z Bukit Mertajam

### Test Users
| Role | Phone Number | Password |
|------|-------------|----------|
| Admin | 0123456789 | password |
| Coach | 0198765432 | password |
| User | 01122334455 | password |

## Frontend Pages

### Admin Pages
- `/training-centers` - Training Centers management with modal-based CRUD

### Parent Pages
- `/children` - Children management with card-based layout

### Updated Pages
- `/register` - Now includes Pusat Latihan dropdown
- `/dashboard` - Role-specific content and quick links

## Design Aesthetic
All pages follow the **Japanese Card Aesthetic**:
- Minimalist design
- Extensive whitespace
- Fine borders (border-zinc-200)
- Clean black and white color palette
- Subtle shadows and hover effects
- Card-based layouts

## Authorization
- Training Center management is restricted to Admin users only
- Parents can only manage their own children
- Policies enforce role-based access control
