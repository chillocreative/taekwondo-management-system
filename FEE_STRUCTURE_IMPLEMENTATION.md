# Fee Structure Implementation Summary

## Overview
Implemented age-based fee structure for yearly and monthly payments with admin configuration panel.

## Fee Structure
- **Yearly Fee (Below 18)**: RM 100.00
- **Yearly Fee (18 and above)**: RM 200.00
- **Monthly Fee (Below 18)**: RM 30.00
- **Monthly Fee (18 and above)**: RM 50.00

## Files Created

### 1. Migration
- `database/migrations/2026_01_03_150000_create_fee_settings_table.php`
  - Creates `fee_settings` table with yearly and monthly fees for both age groups
  - Seeds default values

### 2. Model
- `app/Models/FeeSetting.php`
  - Methods to calculate fees based on age or date of birth
  - `current()` - Get current fee settings
  - `getYearlyFee($age)` - Calculate yearly fee by age
  - `getMonthlyFee($age)` - Calculate monthly fee by age
  - `getYearlyFeeByDob($dateOfBirth)` - Calculate yearly fee by DOB
  - `getMonthlyFeeByDob($dateOfBirth)` - Calculate monthly fee by DOB

### 3. Controller
- `app/Http/Controllers/FeeSettingController.php`
  - `index()` - Display fee settings page
  - `update()` - Update fee settings

### 4. Frontend Page
- `resources/js/Pages/Settings/Fees.jsx`
  - Admin interface to configure fees
  - Real-time fee summary display
  - Separate sections for yearly and monthly fees

## Files Modified

### 1. ChildController.php
- Updated `payment()` method to calculate and pass yearly fee to view
- Updated `initiateOnlinePayment()` to use age-based yearly fee
- Updated `requestOfflinePayment()` to use age-based yearly fee
- Changed from "Yuran Pendaftaran" to "Yuran Tahunan"

### 2. Payment.jsx
- Updated to accept `yearlyFee` and `ageCategory` props
- Displays dynamic fee amount based on child's age
- Shows age category (e.g., "Bawah 18 tahun" or "18 tahun ke atas")

### 3. web.php (Routes)
- Added `/settings/fees` (GET) - Display fee settings
- Added `/settings/fees` (POST) - Update fee settings

## How It Works

1. **User Registration Flow**:
   - User registers and adds a child (Tambah Peserta)
   - System calculates age from `date_of_birth`
   - Determines appropriate yearly fee based on age

2. **Payment Flow**:
   - When user clicks "Bayar" for a child
   - System checks child's age
   - Displays correct yearly fee amount
   - Creates ToyyibPay bill with calculated amount
   - Stores fee amount in `registration_fee` field

3. **Admin Configuration**:
   - Admin can access `/settings/fees`
   - Configure all four fee types
   - Changes apply immediately to new payments

## Database Schema

```sql
CREATE TABLE fee_settings (
    id BIGINT PRIMARY KEY,
    yearly_fee_below_18 DECIMAL(10,2) DEFAULT 100.00,
    yearly_fee_above_18 DECIMAL(10,2) DEFAULT 200.00,
    monthly_fee_below_18 DECIMAL(10,2) DEFAULT 30.00,
    monthly_fee_above_18 DECIMAL(10,2) DEFAULT 50.00,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Next Steps

1. Run migration: `php artisan migrate`
2. Access fee settings at: `/settings/fees`
3. Configure fees as needed
4. Monthly fee payment feature can be implemented later using the same structure

## Notes

- Age is calculated using Carbon: `Carbon::parse($dateOfBirth)->age`
- If no date of birth is provided, system defaults to "below 18" fee
- Monthly fees are configured but not yet implemented in payment flow
- Can be easily extended for monthly recurring payments in the future
