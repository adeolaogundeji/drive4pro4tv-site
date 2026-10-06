const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

menuButton?.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  });
});

const bookingApi = 'https://drive4pro4tv-driving-school.ogundejiadeola0.chatgpt.site/api/bookings';
const programDetails = {
  'first-time': { price: '$85', duration: '60-minute session' },
  'road-test': { price: '$120', duration: '90-minute session' },
  refresher: { price: '$80', duration: '60-minute session' },
};
const bookingModal = document.querySelector('.booking-modal');
const bookingForm = document.querySelector('.booking-form');
const bookingSuccess = document.querySelector('.booking-success');
const programSelect = bookingForm?.querySelector('[name="programId"]');
const appointmentInput = bookingForm?.querySelector('[name="appointmentStart"]');

function updateProgramSummary() {
  const details = programDetails[programSelect.value];
  document.querySelector('[data-book-price]').textContent = details.price;
  document.querySelector('[data-book-duration]').textContent = details.duration;
}

function openBooking(programId) {
  bookingForm.reset();
  programSelect.value = programId || 'first-time';
  const minimum = new Date(Date.now() + 60 * 60 * 1000);
  minimum.setMinutes(minimum.getMinutes() - minimum.getTimezoneOffset());
  appointmentInput.min = minimum.toISOString().slice(0, 16);
  updateProgramSummary();
  bookingSuccess.hidden = true;
  bookingForm.hidden = false;
  bookingForm.querySelector('.booking-error').hidden = true;
  bookingModal.classList.add('open');
  bookingModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  bookingForm.querySelector('input[name="customerName"]').focus();
}

function closeBooking() {
  bookingModal.classList.remove('open');
  bookingModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-book-program]').forEach((button) => button.addEventListener('click', () => {
  mobileNav?.classList.remove('open');
  openBooking(button.dataset.bookProgram);
}));
document.querySelectorAll('[data-close-booking]').forEach((button) => button.addEventListener('click', closeBooking));
programSelect?.addEventListener('change', updateProgramSummary);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && bookingModal.classList.contains('open')) closeBooking(); });

bookingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const error = bookingForm.querySelector('.booking-error');
  const form = new FormData(bookingForm);
  submitButton.disabled = true;
  submitButton.textContent = 'Saving…';
  error.hidden = true;
  try {
    const appointmentStart = new Date(String(form.get('appointmentStart'))).toISOString();
    const response = await fetch(bookingApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: form.get('programId'),
        customerName: form.get('customerName'),
        customerEmail: form.get('customerEmail'),
        customerPhone: form.get('customerPhone'),
        appointmentStart,
        notes: form.get('notes'),
        website: form.get('website'),
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.booking) throw new Error(data.error || 'The booking could not be saved.');
    bookingForm.hidden = true;
    bookingSuccess.hidden = false;
    bookingSuccess.querySelector('small').textContent = `Reference: ${data.booking.id}`;
  } catch (reason) {
    error.textContent = reason instanceof Error ? reason.message : 'The booking could not be saved.';
    error.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Request appointment';
  }
});

