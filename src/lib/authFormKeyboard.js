export function moveAuthFormFocus(event) {
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;

  const form = event.currentTarget.form;
  if (!form) return;

  const fields = Array.from(form.querySelectorAll("[data-auth-field]"))
    .filter((field) => !field.disabled && field.offsetParent !== null);
  const currentIndex = fields.indexOf(event.currentTarget);
  if (currentIndex === -1) return;

  const direction = event.key === "ArrowUp" ? -1 : 1;
  const nextField = fields[currentIndex + direction];
  if (!nextField) return;

  event.preventDefault();
  nextField.focus();
}
