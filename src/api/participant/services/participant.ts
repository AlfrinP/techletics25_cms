/**
 * participant service
 */

import { factories } from '@strapi/strapi';

interface Event {
  id: number;
  attributes: {
    maxRegistrationsAllowed: number;
    participants: {
      data: Array<any>;
    };
  };
}

export default factories.createCoreService('api::participant.participant', ({ strapi }) => ({
  async create(params) {
    const { data } = params;

    // Get the event ID from the data
    const eventId = data.event;

    if (eventId) {
      try {
        // Get the event with its current participants count
        const event = (await strapi.entityService.findOne('api::event.event', Number(eventId), {
          populate: ['participants'],
        })) as unknown as Event;

        if (!event) {
          throw new Error('Event not found');
        }

        // Check if max registrations limit is reached
        const currentParticipantsCount = event.attributes.participants.data.length;
        if (currentParticipantsCount >= event.attributes.maxRegistrationsAllowed) {
          throw new Error('Maximum registrations limit reached for this event');
        }
      } catch (error) {
        throw new Error(`Failed to validate event registration: ${error.message}`);
      }
    }

    // If all checks pass, create the participant
    return super.create(params);
  },
}));
