import { useStore } from '../store';
import type {
  Case,
  Client,
  Communication,
  Consultation,
  DeliveryPartner,
  DocumentItem,
  Employee,
  FeedbackEntry,
  Invoice,
  Lead,
  MarketingCampaign,
  Order,
  Payment,
  Refund,
  Report,
  Restaurant,
  Service,
  Settlement,
  Task,
} from '../store';

const date = (daysOffset: number, hour = 12) => {
  const value = new Date();
  value.setDate(value.getDate() + daysOffset);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};

export function generateSeedData() {
  const restaurants: Restaurant[] = [
    { id: 'm-101', name: 'University of Melbourne', cuisine: 'Computer Science', city: 'Bengaluru', ownerName: 'Karthik Rao', phone: '+91 98450 11223', partnerStatus: 'Active', avgRating: 4.6, commissionRate: 18 },
    { id: 'm-102', name: 'University of Toronto', cuisine: 'Business Analytics', city: 'Mumbai', ownerName: 'Ayesha Merchant', phone: '+91 98201 33445', partnerStatus: 'Active', avgRating: 4.4, commissionRate: 19 },
    { id: 'm-103', name: 'University of British Columbia', cuisine: 'Data Science', city: 'Delhi', ownerName: 'Gurpreet Singh', phone: '+91 98100 55667', partnerStatus: 'Active', avgRating: 4.5, commissionRate: 18 },
    { id: 'm-104', name: 'University of Auckland', cuisine: 'Mechanical Engineering', city: 'Hyderabad', ownerName: 'Sana Farooq', phone: '+91 98490 77889', partnerStatus: 'Active', avgRating: 4.7, commissionRate: 17 },
    { id: 'm-105', name: 'University of Sydney', cuisine: 'Computer Science', city: 'Chennai', ownerName: 'Vijayalakshmi Iyer', phone: '+91 98401 22334', partnerStatus: 'Onboarding', avgRating: 4.3, commissionRate: 18 },
    { id: 'm-106', name: 'University of Manchester', cuisine: 'Public Health', city: 'Kolkata', ownerName: 'Arindam Ghosh', phone: '+91 98300 44556', partnerStatus: 'Active', avgRating: 4.2, commissionRate: 20 },
    { id: 'm-107', name: 'University of Alberta', cuisine: 'Finance', city: 'Pune', ownerName: 'Rohan Kulkarni', phone: '+91 98220 66778', partnerStatus: 'Paused', avgRating: 4.1, commissionRate: 19 },
    { id: 'm-108', name: 'University of Waterloo', cuisine: 'Artificial Intelligence', city: 'Ahmedabad', ownerName: 'Nidhi Shah', phone: '+91 98250 88990', partnerStatus: 'Active', avgRating: 4.8, commissionRate: 17 },
    { id: 'm-109', name: 'University of Leeds', cuisine: 'Environmental Science', city: 'Bengaluru', ownerName: 'Deepa Nair', phone: '+91 99000 12345', partnerStatus: 'Onboarding', avgRating: 4.4, commissionRate: 18 },
  ];

  const customers: Client[] = ([
    ['c-201', 'Ananya Iyer', 'ananya.iyer@example.in', '+91 98451 23001', 'Bengaluru', 'Gold', 28, 18450],
    ['c-202', 'Rahul Deshmukh', 'rahul.d@example.in', '+91 98202 34002', 'Mumbai', 'Silver', 16, 11320],
    ['c-203', 'Simran Kaur', 'simran.kaur@example.in', '+91 98101 45003', 'Delhi', 'Gold', 34, 25280],
    ['c-204', 'Mohammed Sameer', 'sameer.m@example.in', '+91 98491 56004', 'Hyderabad', 'Silver', 19, 14260],
    ['c-205', 'Meera Krishnan', 'meera.k@example.in', '+91 98402 67005', 'Chennai', 'New', 5, 3280],
    ['c-206', 'Ishita Banerjee', 'ishita.b@example.in', '+91 98303 78006', 'Kolkata', 'Gold', 41, 30110],
    ['c-207', 'Aditya Joshi', 'aditya.j@example.in', '+91 98221 89007', 'Pune', 'Silver', 12, 8750],
    ['c-208', 'Kavya Shah', 'kavya.shah@example.in', '+91 98252 90108', 'Ahmedabad', 'Gold', 37, 27800],
    ['c-209', 'Neel Reddy', 'neel.reddy@example.in', '+91 99001 11209', 'Bengaluru', 'New', 3, 1960],
    ['c-210', 'Priya Malhotra', 'priya.m@example.in', '+91 98102 22310', 'Delhi', 'Silver', 22, 16890],
    ['c-211', 'Arjun Nair', 'arjun.nair@example.in', '+91 98452 33411', 'Bengaluru', 'Silver', 14, 10250],
    ['c-212', 'Fatima Sheikh', 'fatima.s@example.in', '+91 98203 44512', 'Mumbai', 'New', 2, 1480],
  ] as Array<[string, string, string, string, string, string, number, number]>).map(([id, name, contactEmail, contactPhone, city, segment, totalOrders, lifetimeValueINR]) => ({
    id,
    name,
    type: 'Customer' as const,
    contactEmail,
    contactPhone,
    city,
    segment,
    totalOrders,
    lifetimeValueINR,
  }));
  const clients: Client[] = [
    ...customers,
    ...restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      type: 'Merchant' as const,
      contactEmail: `${restaurant.id}@studybridge.example`,
      contactPhone: restaurant.phone,
      city: restaurant.city,
      segment: restaurant.partnerStatus,
      totalOrders: 0,
      lifetimeValueINR: 0,
    })),
  ];

  const deliveryPartners: DeliveryPartner[] = [
    { id: 'dp-301', name: 'Suresh Kumar', phone: '+91 98451 30101', city: 'Bengaluru', vehicle: 'Bike', availability: 'On delivery', rating: 4.8, deliveries: 1240 },
    { id: 'dp-302', name: 'Pooja Patil', phone: '+91 98202 30202', city: 'Mumbai', vehicle: 'Scooter', availability: 'Available', rating: 4.9, deliveries: 980 },
    { id: 'dp-303', name: 'Manpreet Gill', phone: '+91 98101 30303', city: 'Delhi', vehicle: 'Bike', availability: 'On delivery', rating: 4.6, deliveries: 1530 },
    { id: 'dp-304', name: 'Rizwan Ali', phone: '+91 98491 30404', city: 'Hyderabad', vehicle: 'Bike', availability: 'Available', rating: 4.7, deliveries: 870 },
    { id: 'dp-305', name: 'Karthik Selvam', phone: '+91 98402 30505', city: 'Chennai', vehicle: 'Bicycle', availability: 'Off shift', rating: 4.5, deliveries: 610 },
    { id: 'dp-306', name: 'Sourav Das', phone: '+91 98303 30606', city: 'Kolkata', vehicle: 'Scooter', availability: 'Available', rating: 4.6, deliveries: 740 },
    { id: 'dp-307', name: 'Nikhil Pawar', phone: '+91 98221 30707', city: 'Pune', vehicle: 'Bike', availability: 'On delivery', rating: 4.8, deliveries: 1050 },
    { id: 'dp-308', name: 'Harsh Patel', phone: '+91 98252 30808', city: 'Ahmedabad', vehicle: 'Bike', availability: 'Available', rating: 4.7, deliveries: 920 },
    { id: 'dp-309', name: 'Sanjay Rao', phone: '+91 99001 30909', city: 'Bengaluru', vehicle: 'Scooter', availability: 'Available', rating: 4.4, deliveries: 540 },
  ];

  const orderRows = [
    ['c-201', 'm-101', 'dp-301', 'Delivered', 'Paid', 'MSc Computer Science', 340, 30, 40, 330, -1],
    ['c-202', 'm-102', 'dp-302', 'Delivered', 'Paid', 'MBA', 420, 25, 50, 395, -1],
    ['c-203', 'm-103', 'dp-303', 'Delivered', 'Paid', 'MSc Data Science', 560, 35, 60, 535, -2],
    ['c-204', 'm-104', 'dp-304', 'Picked up', 'Paid', 'Master of Engineering', 480, 30, 0, 510, 0],
    ['c-205', 'm-105', 'dp-305', 'Preparing', 'Pending', 'Master of Public Health', 290, 25, 20, 295, 0],
    ['c-206', 'm-106', 'dp-306', 'Delivered', 'Paid', 'MSc Finance', 390, 25, 35, 380, -3],
    ['c-207', 'm-107', 'dp-307', 'Cancelled', 'Refunded', 'BSc Computing', 510, 30, 0, 540, -1],
    ['c-208', 'm-108', 'dp-308', 'Delivered', 'Paid', 'Artificial Intelligence thali', 620, 35, 80, 575, -4],
    ['c-209', 'm-109', 'dp-309', 'Placed', 'Pending', 'MSc Environmental Science', 430, 30, 25, 435, 0],
    ['c-210', 'm-103', 'dp-303', 'Delivered', 'Paid', 'MSc Artificial Intelligence', 690, 35, 90, 635, -5],
    ['c-211', 'm-101', 'dp-301', 'Delivered', 'Paid', 'Master of Business Analytics', 360, 25, 0, 385, -6],
    ['c-212', 'm-102', 'dp-302', 'Cancelled', 'Refunded', 'MSc Computer Science', 260, 25, 30, 255, -2],
    ['c-201', 'm-104', 'dp-304', 'Delivered', 'Paid', 'Master of Engineering', 450, 30, 45, 435, -8],
    ['c-203', 'm-108', 'dp-308', 'Delivered', 'Paid', 'MBA', 720, 35, 70, 685, -9],
    ['c-206', 'm-106', 'dp-306', 'Delivered', 'Paid', 'MSc Finance', 440, 25, 40, 425, -10],
    ['c-208', 'm-103', 'dp-303', 'Delivered', 'Paid', 'MSc Data Science', 580, 30, 50, 560, -12],
  ] as const;
  const orders: Order[] = orderRows.map(([clientId, restaurantId, deliveryPartnerId, status, paymentStatus, items, subtotalINR, deliveryFeeINR, discountINR, totalINR, day], index) => ({
    id: `ord-${400 + index}`,
    orderNumber: `APP-26-${String(4101 + index)}`,
    clientId,
    restaurantId,
    deliveryPartnerId,
    placedAt: date(day, 12 + index % 8),
    items: items.split(', '),
    subtotalINR,
    deliveryFeeINR,
    discountINR,
    totalINR,
    status,
    paymentStatus,
    city: restaurants.find((restaurant) => restaurant.id === restaurantId)?.city ?? 'Bengaluru',
    etaMinutes: 25 + (index % 5) * 5,
  }));

  orders.forEach((application, index) => {
    const fee = 28500 + index * 4200;
    application.items = [orderRows[index][5]];
    application.subtotalINR = fee;
    application.deliveryFeeINR = 0;
    application.discountINR = 0;
    application.totalINR = fee;
  });

  const leads: Lead[] = [
    { id: 'lead-501', name: 'Aarav Kulkarni', email: 'admissions@mysoremasala.example', phone: '+91 98452 50101', source: 'School counselor referral', status: 'Qualified', assignedTo: 'Ritika Sen', valueINR: 92000, lastActivity: date(-1), city: 'Bengaluru', cuisine: 'Computer Science' },
    { id: 'lead-502', name: 'Ishita Rao', email: 'hello@tandoortales.example', phone: '+91 98202 50202', source: 'Education outreach', status: 'Contacted', assignedTo: 'Sanjay Verma', valueINR: 78000, lastActivity: date(-2), city: 'Mumbai', cuisine: 'Data Science' },
    { id: 'lead-503', name: 'Zoya Khan', email: 'admissions@chaatco.example', phone: '+91 98101 50303', source: 'Website', status: 'New', assignedTo: 'Sanjay Verma', valueINR: 64000, lastActivity: date(0), city: 'Delhi', cuisine: 'Public Health' },
    { id: 'lead-504', name: 'Rohan Mehta', email: 'team@biryanibae.example', phone: '+91 98491 50404', source: 'Education fair', status: 'Qualified', assignedTo: 'Ritika Sen', valueINR: 114000, lastActivity: date(-3), city: 'Hyderabad', cuisine: 'Mechanical Engineering' },
    { id: 'lead-505', name: 'Diya Nair', email: 'admissions@madrasmeal.example', phone: '+91 98402 50505', source: 'School counselor referral', status: 'Contacted', assignedTo: 'Meera Nair', valueINR: 71000, lastActivity: date(-1), city: 'Chennai', cuisine: 'Computer Science' },
    { id: 'lead-506', name: 'Kabir Das', email: 'hello@howrahroll.example', phone: '+91 98303 50606', source: 'Education outreach', status: 'New', assignedTo: 'Sanjay Verma', valueINR: 55000, lastActivity: date(-4), city: 'Kolkata', cuisine: 'Public Health' },
    { id: 'lead-507', name: 'Meher Shah', email: 'admissions@deccandeli.example', phone: '+91 98221 50707', source: 'Website', status: 'Converted', assignedTo: 'Ritika Sen', valueINR: 86000, lastActivity: date(-5), city: 'Pune', cuisine: 'Finance' },
    { id: 'lead-508', name: 'Arjun Patel', email: 'team@kutchkitchen.example', phone: '+91 98252 50808', source: 'Education fair', status: 'Qualified', assignedTo: 'Meera Nair', valueINR: 99000, lastActivity: date(-2), city: 'Ahmedabad', cuisine: 'Artificial Intelligence' },
  ];

  const cases: Case[] = orders
    .filter((order) => ['Cancelled', 'Preparing', 'Picked up'].includes(order.status) || ['ord-400', 'ord-405', 'ord-411'].includes(order.id))
    .map((order, index) => ({
      id: `inc-${601 + index}`,
      clientId: order.clientId,
      orderId: order.id,
      restaurantId: order.restaurantId,
      deliveryPartnerId: order.deliveryPartnerId,
      title: order.status === 'Cancelled' ? `Cancellation review · ${order.orderNumber}` : `Delivery follow-up · ${order.orderNumber}`,
      stage: index % 3 === 0 ? 'Investigating' : index % 3 === 1 ? 'Assigned' : 'Resolved',
      valueINR: order.totalINR,
      priority: index % 3 === 0 ? 'High' : index % 2 === 0 ? 'Medium' : 'Low',
      incidentType: order.status === 'Cancelled' ? 'Cancellation / refund' : index % 2 ? 'Late delivery' : 'Order accuracy',
    }));

  const tasks: Task[] = [
    { id: 'task-701', caseId: cases[0].id, title: 'Call customer about cancelled order', assignee: 'Ravi Menon', due: date(0, 16), status: 'Pending' },
    { id: 'task-702', caseId: cases[1].id, title: 'Confirm prep-time update with restaurant', assignee: 'Meera Nair', due: date(0, 17), status: 'Pending' },
    { id: 'task-703', caseId: cases[2].id, title: 'Review refund for order SK-82048', assignee: 'Ishant Agarwal', due: date(1, 12), status: 'Pending' },
    { id: 'task-704', caseId: cases[3].id, title: 'Complete merchant menu onboarding', assignee: 'Neha Joshi', due: date(1, 15), status: 'Pending' },
    { id: 'task-705', caseId: cases[4].id, title: 'Reconcile University of Melbourne weekly settlement', assignee: 'Ishant Agarwal', due: date(2, 11), status: 'Pending' },
    { id: 'task-706', caseId: cases[5].id, title: 'Check in with delivery partner after incident', assignee: 'Ritika Sen', due: date(-1, 14), status: 'Done' },
    { id: 'task-707', caseId: cases[0].id, title: 'Share promo credit confirmation', assignee: 'Ravi Menon', due: date(2, 16), status: 'Pending' },
    { id: 'task-708', caseId: cases[1].id, title: 'Verify merchant FSSAI certificate', assignee: 'Neha Joshi', due: date(3, 10), status: 'Pending' },
  ];

  const refunds: Refund[] = [
    { id: 'rf-801', orderId: 'ord-406', amountINR: 540, reason: 'Restaurant unable to fulfil order', status: 'Processed', requestedAt: date(-1, 15) },
    { id: 'rf-802', orderId: 'ord-411', amountINR: 255, reason: 'Customer cancelled before preparation', status: 'Processed', requestedAt: date(-2, 13) },
    { id: 'rf-803', orderId: 'ord-403', amountINR: 120, reason: 'Missing item reported after delivery', status: 'Pending', requestedAt: date(0, 11) },
  ];
  const payments: Payment[] = orders.map((order, index) => ({
    id: `pay-${850 + index}`,
    orderId: order.id,
    amountINR: order.totalINR,
    method: (['UPI', 'Card', 'Cash', 'Wallet'] as const)[index % 4],
    status: order.paymentStatus === 'Paid' ? 'Captured' : order.paymentStatus,
    paidAt: order.placedAt,
  }));
  const settlements: Settlement[] = restaurants.slice(0, 8).map((restaurant, index) => ({
    id: `set-${901 + index}`,
    restaurantId: restaurant.id,
    period: '01–15 Nov 2026',
    amountINR: [48250, 36780, 62940, 51400, 22150, 34800, 18600, 55720][index],
    ordersCount: [86, 62, 104, 79, 34, 51, 26, 91][index],
    status: index < 3 ? 'Paid' : index < 6 ? 'Processing' : 'Due',
    dueDate: date(index < 3 ? -2 : 4, 12),
  }));

  const consultations: Consultation[] = [
    { id: 'meet-1001', clientId: 'm-105', consultant: 'Meera Nair', date: date(0, 15), status: 'Scheduled', notes: 'Discuss program shortlist and application timeline', meetingType: 'Merchant onboarding' },
    { id: 'meet-1002', clientId: 'm-109', consultant: 'Ritika Sen', date: date(1, 11), status: 'Scheduled', notes: 'Review visa checklist and application deadlines', meetingType: 'Partner success review' },
    { id: 'meet-1003', clientId: 'm-107', consultant: 'Sanjay Verma', date: date(-1, 14), status: 'Completed', notes: 'Reviewed scholarship options and university shortlist', meetingType: 'Merchant check-in' },
    { id: 'meet-1004', clientId: 'm-101', consultant: 'Meera Nair', date: date(2, 16), status: 'Scheduled', notes: 'Graduate application counselling', meetingType: 'Business review' },
    { id: 'meet-1005', clientId: 'm-103', consultant: 'Sanjay Verma', date: date(-3, 12), status: 'Completed', notes: 'Statement of purpose and reference review', meetingType: 'Merchant onboarding' },
    { id: 'meet-1006', clientId: 'm-102', consultant: 'Ritika Sen', date: date(3, 10), status: 'Scheduled', notes: 'Visa interview preparation and fee schedule', meetingType: 'Partner success review' },
  ];

  const services: Service[] = [
    { id: 'svc-1', name: 'StudyBridge Partner Basic', category: 'Merchant plan', priceINR: 0, description: 'Marketplace listing, order dashboard and standard merchant support.' },
    { id: 'svc-2', name: 'StudyBridge Growth', category: 'Merchant plan', priceINR: 2499, description: 'Promoted placement, campaign insights and priority partner support per month.' },
    { id: 'svc-3', name: 'Local Delivery Plus', category: 'Delivery subscription', priceINR: 499, description: 'Customer delivery membership with reduced delivery fees on eligible orders.' },
    { id: 'svc-4', name: 'City Saver Pass', category: 'Customer subscription', priceINR: 149, description: 'Monthly savings on delivery fees and rotating neighbourhood offers.' },
    { id: 'svc-5', name: 'Featured Restaurant Slot', category: 'Advertising', priceINR: 12000, description: 'Seven-day sponsored placement in a selected city cuisine collection.' },
    { id: 'svc-6', name: 'New Neighbourhood Launch', category: 'Advertising', priceINR: 8500, description: 'In-app launch campaign for new restaurants and service areas.' },
    { id: 'svc-7', name: 'Bulk Meal Desk', category: 'Business orders', priceINR: 0, description: 'Scheduled group meals for offices with consolidated order support.' },
  ];

  const documents: DocumentItem[] = restaurants.slice(0, 8).map((restaurant, index) => ({
    id: `doc-${1101 + index}`,
    title: ['Academic transcripts', 'Passport copy', 'IELTS score report', 'Statement of purpose'][index % 4],
    type: ['Food safety', 'Contract', 'Settlement', 'Tax compliance'][index % 4],
    status: index === 4 || index === 6 ? 'Pending' : index === 7 ? 'Rejected' : 'Verified',
    owner: restaurant.name,
    reference: `DOC-${restaurant.id.toUpperCase()}`,
    city: restaurant.city,
  }));

  const communications: Communication[] = [
    { id: 'msg-1', from: 'Ravi Menon · Support', message: 'Refund update sent for order SK-82047 after restaurant cancellation.', timestamp: date(0, 12), channel: 'WhatsApp', audience: 'Customer' },
    { id: 'msg-2', from: 'Meera Nair · City Ops', message: 'Pickup time confirmation requested from University of Melbourne.', timestamp: date(0, 11), channel: 'Call', audience: 'Merchant' },
    { id: 'msg-3', from: 'StudyBridge Dispatch', message: 'Delivery assignment shared for order SK-82044.', timestamp: date(-1, 20), channel: 'In-app', audience: 'Delivery partner' },
    { id: 'msg-4', from: 'Ritika Sen · Partner Success', message: 'Settlement statement shared with University of Toronto.', timestamp: date(-1, 17), channel: 'Email', audience: 'Merchant' },
    { id: 'msg-5', from: 'StudyBridge Offers', message: 'Weekend saver offer delivered to Bengaluru customers.', timestamp: date(-2, 10), channel: 'SMS', audience: 'Customer' },
    { id: 'msg-6', from: 'Ravi Menon · Support', message: 'Missing item report acknowledged for order SK-82044.', timestamp: date(-2, 15), channel: 'WhatsApp', audience: 'Customer' },
    { id: 'msg-7', from: 'City Operations', message: 'Rain alert and safety reminder shared with delivery fleet.', timestamp: date(-3, 14), channel: 'In-app', audience: 'Delivery partner' },
    { id: 'msg-8', from: 'Sanjay Verma · Sales', message: 'StudyBridge Growth plan details sent to Ishita Rao.', timestamp: date(-4, 12), channel: 'Email', audience: 'Merchant' },
  ];

  const employees: Employee[] = [
    { id: 'emp-1', name: 'Meera Nair', role: 'Branch Manager', email: 'meera.nair@studybridge.example', location: 'Bengaluru' },
    { id: 'emp-2', name: 'Ritika Sen', role: 'Operations Manager', email: 'ritika.sen@studybridge.example', location: 'Bengaluru' },
    { id: 'emp-3', name: 'Sanjay Verma', role: 'Sales Executive', email: 'sanjay.verma@studybridge.example', location: 'Hyderabad' },
    { id: 'emp-4', name: 'Neha Joshi', role: 'Documentation Executive', email: 'neha.joshi@studybridge.example', location: 'Pune' },
    { id: 'emp-5', name: 'Ishant Agarwal', role: 'Accounts Executive', email: 'ishant.agarwal@studybridge.example', location: 'Delhi' },
    { id: 'emp-6', name: 'Ravi Menon', role: 'Customer Support', email: 'ravi.menon@studybridge.example', location: 'Chennai' },
    { id: 'emp-7', name: 'Pallavi Kulkarni', role: 'City Operations Lead', email: 'pallavi.k@studybridge.example', location: 'Mumbai' },
    { id: 'emp-8', name: 'Amanpreet Kaur', role: 'Customer Support', email: 'amanpreet.k@studybridge.example', location: 'Kolkata' },
    { id: 'emp-9', name: 'Devang Shah', role: 'Merchant Success', email: 'devang.shah@studybridge.example', location: 'Ahmedabad' },
  ];

  const marketingCampaigns: MarketingCampaign[] = [
    { id: 'camp-1', name: 'Bengaluru Lunch Rush', leads: 820, conversions: 214, spendINR: 185000, orders: 1380, gmvINR: 924600 },
    { id: 'camp-2', name: 'Mumbai Monsoon Meals', leads: 690, conversions: 176, spendINR: 162000, orders: 1120, gmvINR: 806400 },
    { id: 'camp-3', name: 'Delhi Weekend Feast', leads: 940, conversions: 263, spendINR: 228000, orders: 1760, gmvINR: 1320000 },
    { id: 'camp-4', name: 'Hyderabad Mechanical Engineering Week', leads: 570, conversions: 190, spendINR: 146000, orders: 990, gmvINR: 772200 },
    { id: 'camp-5', name: 'Pune First Order Offer', leads: 430, conversions: 121, spendINR: 98000, orders: 740, gmvINR: 481000 },
  ];

  const feedbackEntries: FeedbackEntry[] = [
    { id: 'ticket-1', customer: 'Rahul Deshmukh', rating: 2, comment: 'Order arrived later than the updated ETA; please review the delivery hand-off.', status: 'In Progress', orderId: 'ord-401', city: 'Mumbai', category: 'Complaint' },
    { id: 'ticket-2', customer: 'Ananya Iyer', rating: 5, comment: 'The dosa was crisp and the delivery partner was very courteous.', status: 'Resolved', orderId: 'ord-400', city: 'Bengaluru', category: 'Rating' },
    { id: 'ticket-3', customer: 'Meera Krishnan', rating: 3, comment: 'Need help updating the delivery address for my next order.', status: 'Open', orderId: 'ord-404', city: 'Chennai', category: 'Support ticket' },
    { id: 'ticket-4', customer: 'Ishita Banerjee', rating: 4, comment: 'Great roll, but one chutney cup was missing from the order.', status: 'Open', orderId: 'ord-405', city: 'Kolkata', category: 'Complaint' },
    { id: 'ticket-5', customer: 'Aditya Joshi', rating: 2, comment: 'Restaurant cancelled after accepting; requesting cancellation reason.', status: 'Resolved', orderId: 'ord-406', city: 'Pune', category: 'Support ticket' },
    { id: 'ticket-6', customer: 'Kavya Shah', rating: 5, comment: 'The thali arrived warm and well packed. Excellent experience.', status: 'Resolved', orderId: 'ord-407', city: 'Ahmedabad', category: 'Rating' },
    { id: 'ticket-7', customer: 'Fatima Sheikh', rating: 1, comment: 'The order was cancelled and I am checking the refund timeline.', status: 'In Progress', orderId: 'ord-411', city: 'Mumbai', category: 'Complaint' },
    { id: 'ticket-8', customer: 'Simran Kaur', rating: 4, comment: 'Please share the invoice for my recent family order.', status: 'Open', orderId: 'ord-402', city: 'Delhi', category: 'Support ticket' },
  ];

  const invoices: Invoice[] = [
    ...settlements.map((settlement, index) => ({
      id: `inv-${1201 + index}`,
      clientId: settlement.restaurantId,
      amountINR: settlement.amountINR,
      paid: settlement.status === 'Paid',
      dueDate: settlement.dueDate,
      invoiceType: 'Merchant settlement' as const,
      reference: settlement.id,
    })),
    ...refunds.map((refund, index) => ({
      id: `inv-ref-${index + 1}`,
      clientId: orders.find((order) => order.id === refund.orderId)?.clientId ?? 'c-201',
      amountINR: refund.amountINR,
      paid: refund.status === 'Processed',
      dueDate: refund.requestedAt,
      invoiceType: 'Refund' as const,
      reference: refund.id,
    })),
  ];

  const reports: Report[] = [
    { id: 'rpt-1', title: 'Daily order pulse · Bengaluru', date: date(-1), summary: '1,284 orders; 96.2% on-time delivery and 2.1% cancellations across Bengaluru.' },
    { id: 'rpt-2', title: 'City GMV and net revenue', date: date(-2), summary: 'Delhi and Bengaluru led GMV; platform revenue tracked at 18.4% blended take rate.' },
    { id: 'rpt-3', title: 'Refund and cancellation review', date: date(-3), summary: 'Refund requests concentrated in restaurant cancellations and missing-item complaints.' },
    { id: 'rpt-4', title: 'Merchant settlement reconciliation', date: date(-4), summary: 'Three city partner batches paid; five batches processing or due in the current cycle.' },
    { id: 'rpt-5', title: 'Customer repeat-rate snapshot', date: date(-7), summary: 'Gold and Silver members contributed 68% of repeat orders in the last seven days.' },
  ];

  const store = useStore.getState();
  store.setLeads(leads);
  store.setClients(clients);
  store.setRestaurants(restaurants);
  store.setDeliveryPartners(deliveryPartners);
  store.setOrders(orders);
  store.setRefunds(refunds);
  store.setPayments(payments);
  store.setSettlements(settlements);
  store.setCases(cases);
  store.setTasks(tasks);
  store.setInvoices(invoices);
  store.setConsultations(consultations);
  store.setServices(services);
  store.setDocuments(documents);
  store.setCommunications(communications);
  store.setEmployees(employees);
  store.setMarketingCampaigns(marketingCampaigns);
  store.setFeedbackEntries(feedbackEntries);
  store.setReports(reports);
}
