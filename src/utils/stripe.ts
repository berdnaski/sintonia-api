import Stripe from 'stripe';
import { prisma } from '../database/prisma-client';

export const stripe = new Stripe(process.env.STRIPE_SECRET as string, {
  httpClient: Stripe.createFetchHttpClient(),
})

export const getStripeCustomerByEmail = async (email: string) => {
  const customers = await stripe.customers.list({ email });
  return customers.data[0];
};

export const createStripeCustomer = async (data: {
  email: string;
  name?: string;
}) => {
  const customer = await getStripeCustomerByEmail(data?.email);
  if (customer) {
    return customer;
  }

  return stripe.customers.create({
    email: data.email,
    name: data.name,
  })
}

export const generateCheckout = async (userId: string, email: string) => {
  try {
    const customer = await createStripeCustomer({
      email,
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      client_reference_id: userId,
      customer: customer.id,
      success_url: `http://localhost:3000/done`,
      cancel_url: `http://localhost:3000/cancel`,
      line_items: [
        {
          price: process.env.STRIPE_ID_PLAN,
          quantity: 1,
        },
      ],
    });

    return  {
      url: session.url
    }
  } catch (err) {
    console.log('errr', err);
  }
}

export const handleCheckoutSessionCompleted = async (event: {
  data: { object: Stripe.Checkout.Session };
}) => {
  const idUser = event.data.object.client_reference_id as string;
  const stripeSubscriptionId = event.data.object.subscription as string;
  const stripeCustomerId = event.data.object.customer as string;  
  const checkoutStatus = event.data.object.status;

  if (checkoutStatus !== 'complete') return;

  if (!idUser || !stripeSubscriptionId || !stripeCustomerId) {  
    throw new Error(
      'idUser, stripeSubscriptionId, stripeCustomerId is required'  
    );
  }

  const userExist = await prisma.user.findFirst({ where: { id: idUser } });

  if (!userExist) {
    throw new Error('user not found');
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId, 
      stripeSubscriptionId,
    },
  });
};

export const handleSubscriptionSessionCompleted = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const subscriptionStatus = event.data.object.status;
  const stripeCustomerId = event.data.object.customer as string;  
  const stripeSubscriptionId = event.data.object.id as string;

  const userExist = await prisma.user.findFirst({
    where: { stripeCustomerId },  
  });

  if (!userExist) {
    throw new Error('user stripeCustomerId not found');
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId, 
      stripeSubscriptionId,
      stripeSubscriptionStatus: subscriptionStatus,
    },
  });
};

export const handleCancelPlan = async (event: {
  data: { object: Stripe.Subscription };
}) => {
  const stripeCustomerId = event.data.object.customer as string; 

  const userExist = await prisma.user.findFirst({
    where: { stripeCustomerId }, 
  });

  if (!userExist) {
    throw new Error('user stripeCustomerId not found');
  }

  await prisma.user.update({
    where: {
      id: userExist.id,
    },
    data: {
      stripeCustomerId, 
      stripeSubscriptionStatus: null,
    },
  });
};


export const handleCancelSubscription = async (idSubscriptions: string) => {
  const subscription = await stripe.subscriptions.update(idSubscriptions, {
    cancel_at_period_end: true,
  });

  return subscription;
};

export async function createPortalCustomer(stripeCustomerId: string): Promise<any> {
  try {
    if (!process.env.STRIPE_SECRET) {
      throw new Error('STRIPE_SECRET environment variable is missing');
    }
    
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    
    if (!customer || customer.deleted) {
      throw new Error('Invalid or deleted Stripe customer');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: process.env.STRIPE_RETURN_URL
    });

    return session.url;

  } catch (error: any) {
    console.error('Portal creation error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      throw new Error('Please configure the Customer Portal in your Stripe Dashboard first');
    }
    
    throw new Error('Error creating customer portal');
  }
}

