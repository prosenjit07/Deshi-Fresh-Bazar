## ENTER digital ocean password
ssh prosenjit@24.199.93.141
cd ~/Deshi-Fresh-Bazar
git pull origin main
npm install
npm run build
pm2 restart all

## Compare latest commit with GitHub.
git log --oneline -1

## Need password for encryption the serve

public ip: 24.199.93.141
Private IP: 10.116.0.2
server region: NYC1


## Update  .env

nano .env.production
pm2 restart all




Transaction API error: Transaction not found. Transaction ID is invalid, refers to an old closed transaction Prisma doesn't have information about anymore, or was obtained before disconnecting.


payload:

{name: "ফোজলি আম (বিষমুক্ত). Fojli", slug: "fozli ",…}
categoryId
: 
"cmb3fmxp700004clhvl368kch"
description
: 
"মিষ্টি স্বাদ ও রসালো গঠনের জন্য জনপ্রিয় এই আম সাতক্ষীরা ও রাজশাহী অঞ্চল থেকে সংগ্রহ করা হয়। "
details
: 
"<p>ওজন: ১২ অথবা ২২ kg,</p><p>উৎপত্তি: উত্তরবঙ্গ, বাংলাদেশ,</p><p>জাত: প্রিমিয়াম ফোজলি,</p><p>সংরক্ষণ: ঠাণ্ডা ও শুকনো জায়গায় রাখুন,</p><p>মেয়াদ: স্বাভাবিক তাপমাত্রায় ৭-১০ দিন</p>"
image
: 
"/uploads/1750092200960-5ttkbvtqmsx.jpg"
name
: 
"ফোজলি আম (বিষমুক্ত). Fojli"
packages
: 
[{name: "10 KG Crate - Home Delivery ", price: 1200, id: "cmooormfq0004js04hr7cycqy"},…]
0
: 
{name: "10 KG Crate - Home Delivery ", price: 1200, id: "cmooormfq0004js04hr7cycqy"}
1
: 
{name: "20 KG Crate - Home Delivery ", price: 2350, id: "cmooormfq0005js04lmpqz1mf"}
2
: 
{name: "10 KG Crate - Currier Pickup ", price: 1100, id: "cmooormfq0006js04vpo7iij1"}
3
: 
{name: "20 KG Crate - Currier Pickup ", price: 2150, id: "cmooormfq0007js04l9nksffv"}
price
: 
"120"
slug
: 
"fozli "
status
: 
"INACTIVE"
stock
: 
"0"


{
    "error": "Transaction API error: Transaction not found. Transaction ID is invalid, refers to an old closed transaction Prisma doesn't have information about anymore, or was obtained before disconnecting."
}

admin pannel product edit not work. fix it
Note: but local host it is working perfectly.


