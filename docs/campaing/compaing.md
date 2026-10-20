1. Register a Guest(POST)

http://localhost:8080/admin/guests

{
  "firstName": "Stavan",
  "lastName": "Dalal",
  "phone": "9373369332",
  "email": "dalalstavan7@gmail.com",
  "dateOfBirth": "1996-09-18",  (Add dob for birthday campaign)
  "idProofType": "AADHAR_CARD",
  "idProofNumber": "1250552523",
  "address": "Sindhi Meghe",
  "city": "Wardha",
  "state": "Maharashtra",
  "postalCode": "442001"
}


2. Create a room

http://localhost:8080/admin/room/create

{
  "roomNumber": "101",
  "roomType": "DELUXE",
  "pricePerNight": 5000.00,
  "capacity": 2,
  "roomStatus" : "AVAILABLE"
}

3. Create a booking

http://localhost:8080/booking/create

{
  "guestId": 5,
  "roomId": 5,
  "checkInDate": "2026-09-15",
  "checkOutDate": "2026-09-18",
  "paymentType": "FULL",
  "paymentMethod": "CASH"
}






4. add manually back date data in db for campaign Stay Anniversay

(add manual data to send anniversary campaign to valid guests, who booked the Hotel 1 year back,
INSERT INTO booking (booking_status, check_in_date, check_out_date, total_amount, guest_id, room_id)
VALUES ('BOOKED', '2025-09-18', '2025-09-20', 5000.00, 10, 5);

now create the campaign for stay anniversary
http://localhost:8080/admin/campaigns
{
  "campaignName": "Stay Anniversary Celebration",
  "subjectLine": "Happy Stay Anniversary from Hotel Aatithya!",
  "emailContent": "Dear {name},<br><br>It has been a year since your stay with us at Hotel Aatithya! To celebrate your stay anniversary, we would love to offer you a complimentary     breakfast on your next visit.<br><br>We hope to see you again soon!",
  "targetAudience": "STAY_ANNIVERSARIES",
  "campaignType": "ANNIVERSARY_GREETING"
}





5.http://localhost:8080/admin/campaigns (campaign for upcoming birthdays)

create guest with date of birth like (22/09/1996) to send automatic upcoming birthday campaign,,,,, it checks upcoming 7 days 

{
  "campaignName": "September Birthday Special",
  "subjectLine": "Early Birthday Wishes from Hotel Aatithya!",
  "emailContent": "Dear {name},<br><br>We noticed your birthday is coming up! Celebrate with us and enjoy 20% off your next reservation using code <strong>BDAY20</strong>.",
  "targetAudience": "UPCOMING_BIRTHDAYS",
  "campaignType": "BIRTHDAY_GREETING"
}



6. http://localhost:8080/admin/campaigns


{
  "campaignName": "VIP Frequent Guest Upgrade",
  "subjectLine": "A Special Privilege for Your Next Stay from Hotel Aatithya!",
  "emailContent": "Dear {name},<br><br>Thanks for your frequent visits at Hotel Aatithya! We are pleased to offer you a complimentary room upgrade during your next stay.",
  "targetAudience": "FREQUENT_VISITORS",
  "campaignType": "MEMBERSHIP_OFFERS"
}


7. All the campaigns are created with DRAFT, we have to send the campaigns manually.

http://localhost:8080/admin/campaigns/{campaignId}/send

{
  "id": 7,
  "campaignName": "Stay Anniversary Celebration",
  "subjectLine": "Happy Stay Anniversary from Hotel Aatithya!",
  "targetAudience": "STAY_ANNIVERSARIES",
  "campaignType": "ANNIVERSARY_GREETING",
  "status": "SENT",
  "createdAt": "2026-09-15T18:12:40"
}

8. Check the guests, to whom the campaign is sent.
http://localhost:8080/admin/campaigns/1/audience


9. Frequent visitors,,,


http://localhost:8080/admin/campaigns (POST)


{
  "campaignName": "VIP Frequent Guest Offer",
  "subjectLine": "Exclusive VIP Reward Just For You!",
  "emailContent": "Dear {name},<br><br> Thanks for your frequent visits at Hotel Aatithya!, We are pleased to offer you a complimentary room upgrade during your next stay.",
  "targetAudience": "FREQUENT_VISITORS",
  "campaignType": "MEMBERSHIP_OFFERS"
}




10. Festival campaign

http://localhost:8080/admin/campaigns

{
  "campaignName": "Diwali Festival Greetings",
  "subjectLine": "Celebrate Diwali with Hotel Aatithya!",
  "emailContent": "Dear {name},<br><br>Warm festive greetings from Hotel Aatithya! Book early using code <strong>FESTIVE2026</strong> to avail flat discounts.",
  "targetAudience": "ALL_CUSTOMERS",
  "campaignType": "FESTIVAL_OFFERS"
}



11. seasonal campaigns

http://localhost:8080/admin/campaigns

{
  "campaignName": "Monsoon Stay Reunion",
  "subjectLine": "We Miss You at Hotel Aatithya!",
  "emailContent": "Dear {name},<br><br>Relive your stay at Hotel Aatithya. Book now and enjoy special return-guest privileges.",
  "targetAudience": "BY_DATE_RANGE",
  "campaignType": "SEASONAL_DISCOUNTS",
  "filterStartDate": "2026-06-01",
  "filterEndDate": "2026-08-31"
}


12. delete campaign

http://localhost:8080/admin/campaigns/6 (DELETE)

13. GEt all Campaigns

http://localhost:8080/admin/campaigns (GET)



