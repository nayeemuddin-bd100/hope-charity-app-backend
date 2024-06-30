# Requirement Analysis: Hope (Charity Management App)

## Introduction
The purpose of this document is to outline the requirements for Hope, a charity management app that helps users donate to various causes, track their donations, attend various events, create blogs, and manage donations. The app serves as a platform to connect donors with causes and simplify the donation process.

## Objectives
- Provide a user-friendly platform for making donations.
- Ensure transparency and trust between donors and charities.
- Facilitate easy tracking and management of donations.
- Promote charitable causes and encourage user engagement.

## Functional Requirements

### Authentication
- Registration and login system.
- Users can reset their password by receiving a reset link via email.
- Implement secure password hashing mechanisms to store user passwords.
- Role-based authentication (e.g., Admin, Super Admin, Donor, Volunteer).
- Token-based authorization (e.g., access token, refresh token).

### Admin
- Admins can view, update, suspend, or delete user accounts.
- Manage user roles and permissions.
- Admins manage donor profiles.
- Track donor activities, donation amounts, and preferences.
- Admins can delete and manage volunteer profiles.
- Admins can create, update, and delete blog posts of users.
- Admins can create, update, or manage causes and events to raise funds.

### Donor
- Donors can create and manage personal profiles.
- Donors can select causes to donate and attend events as well.
- Track donation history and preferred causes.

### Volunteer
- Volunteers can be assigned specific tasks for events.
- Volunteers can participate in events.
- Volunteers can create, update, and delete posts.

### Cause Listing
- Allow admin or super admin to create/update/delete and manage causes.
- Show cause progress such as title, description, goal amount, and raised amount with percentage.
- Implement search options to navigate specific causes.
- Implement pagination.

### Events Listing
- Display campaign/event details with title, location, and time.
- Every event must have specific volunteers.
- Admins can assign tasks to volunteers for specific events or campaigns.
- Allow admin and super admin only to create and manage events.
- Implement pagination.
- Implement search option.

### Donor Listing
- Display donor's details with name, email, and total donations.
- Allow admin and super admin to manage donors.
- Implement pagination.
- Implement search option.

### Volunteer Listing
- Display volunteer’s details with name and email.
- Allow admin and super admin to manage volunteers.
- Implement pagination.
- Implement search option.

### Donation Progress
- Support multiple payment methods (e.g., sslcommerce).
- Automatically generate payment receipts after donations.
- Send acknowledgment messages to donors after successful donations.

### Blog
- Only admin and volunteer can post a blog.
- Admin can delete the blog of a volunteer.

### Dashboard for Admin
- Admin can manage volunteers in the dashboard.
- Admin can add and manage causes in the dashboard.
- Admin can add and manage events in the dashboard.
- Admin can see analytics of donations.

## Technologies
- **Database**: MongoDB with Mongoose for object modeling.
- **Backend**: Node.js with Express.js for API development.
- **Frontend**: Next.js for server-side rendered React applications.
- **Styling**: Tailwind CSS for utility-first CSS framework.
- **Security**: Bcrypt for password hashing.
- **Email**: SendGrid for email notifications.

## Database Design

### Database Relationship
- **User - Donor/Volunteer/Admin Relationship (one-to-one relationship)**:
  - User should be linked with Donor/Volunteer/Admin through foreign key (donor_id, volunteer_id, admin_id).
- **Volunteer - Event Relationship (many-to-many relationship)**:
  - Multiple volunteers can participate in multiple events.
  - Multiple events can be assigned to multiple volunteers.
- **Donor - Donation Relationship (one-to-many relationship)**:
  - A Donor can make multiple Donations, handled through the (donorId) foreign key in the Donation document.
  - Each donation associated with (donorId).
- **Cause - Donation Relationship (one-to-many relationship)**:
  - A cause can receive multiple donations through (donationId) foreign key.
  - Each Donation associated with causeId.
- **Admin/Volunteer - BlogPost Relationship (one-to-many relationship)**:
  - Admin/Volunteer (user) can have multiple posts through blogId.
  - Each Post is associated with only one user through (authorId) foreign key.
- **Admin - Event Relationship (one-to-many relationship)**:
  - Each admin can have multiple events.

### Database Schema

#### Users
- _id (Primary Key)
- name
- email
- password
- role (Admin, Super Admin, Donor, Volunteer)
- adminId (foreign key)
- donorId (foreign key)
- volunteerId (foreign key)
- createdAt
- updatedAt

#### Admin
- _id (Primary Key)
- name
- email
- profileImage
- contactNo
- address
- causeId[] (foreign key)
- eventId[] (foreign key)
- blogId[] (foreign key)
- createdAt
- updatedAt

#### Donor
- _id (Primary Key)
- name
- email
- profileImage
- contactNo
- address
- donationId[] (foreign key)
- createdAt
- updatedAt

#### Volunteer
- _id (Primary Key)
- name
- email
- profileImage
- contactNo
- address
- eventId[] (foreign key)
- blogId[] (foreign key)
- createdAt
- updatedAt

#### Event
- _id (Primary Key)
- title
- description
- location
- date
- startTime
- endTime
- createdBy: adminId (foreign key)
- volunteerId[]
- createdAt
- updatedAt

#### Blog
- _id (Primary Key)
- title
- description
- image
- author: [adminId (foreign key) | volunteerId (foreign key)]
- createdAt
- updatedAt

#### Donation
- _id (Primary Key)
- amount
- date
- donorId (foreign key)
- causeId (foreign key)
- createdAt
- updatedAt

#### Cause
- _id (Primary Key)
- title
- description
- goalAmount
- raisedAmount
- createdBy: adminId (foreign key)
- createdAt
- updatedAt
