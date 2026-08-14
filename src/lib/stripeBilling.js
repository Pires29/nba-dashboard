export async function removeStripeCustomerAndSubscriptions(stripe, user) {
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      if (error?.code !== "resource_missing") throw error;
    }
  }

  if (user.stripeCustomerId) {
    try {
      await stripe.customers.del(user.stripeCustomerId);
    } catch (error) {
      if (error?.code !== "resource_missing") throw error;
    }
  }
}

