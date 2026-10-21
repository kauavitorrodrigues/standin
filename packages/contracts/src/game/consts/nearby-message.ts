// The most characters a nearby message may have when it is sent. A message that
// is only a link is exempt.
export const NEARBY_MESSAGE_MAX_LENGTH = 50;

// From this length the header shows the counter, as "N/50".
export const NEARBY_MESSAGE_COUNTER_AT = 35;

// From this length the counter takes the warning color.
export const NEARBY_MESSAGE_WARN_AT = 40;

// The most the receiver accepts. A long link passes, a huge text does not.
export const NEARBY_MESSAGE_RECEIVE_MAX_LENGTH = 500;
