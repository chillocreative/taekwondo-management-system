# Offline Payment QR Code Setup

## Important: QR Code Image

The offline payment feature requires a DuitNow QR code image to be placed in the public directory.

### Steps to add the QR code:

1. Save the DuitNow QR code image (the pink one with "A&Z TAEKWONDO ACADEMY")
2. Place it in: `public/images/duitnow-qr.png`
3. Make sure the filename is exactly: `duitnow-qr.png`

### File location:
```
public/
  └── images/
      └── duitnow-qr.png  ← Place your QR code here
```

The image should be the DuitNow QR code provided by the user showing:
- DuitNow QR logo
- QR code for A&Z TAEKWONDO ACADEMY  
- "MALAYSIA NATIONAL QR" text
- Touch 'n Go eWallet merchant partner logo

Once the image is in place, users will be able to:
- View the QR code on the offline payment page
- Download the QR code to their device
- Upload their payment slip after making payment
