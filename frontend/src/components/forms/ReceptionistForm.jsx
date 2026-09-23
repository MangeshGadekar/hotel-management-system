import React from "react";

const ReceptionistForm = ({
  values,
  errors = {},
  onChange,
  onSubmit,
  onClose,
}) => {
  const handle = (field) => (e) => onChange(field, e.target.value);

  return (
    <div className="">
      <form onSubmit={onSubmit}>
        <input
          type="email"
          onChange={handle('email')}
          placeholder="email"
          value={values.email}
          autoFocus
        />
        <input
          type="text"
          onChange={handle('username')}
          placeholder="username"
          value={values.username}
        />
        <div className="flex gap-3">
          <input
            type="text"
            onChange={handle('firstname')}
            placeholder="firstname"
            value={values.firstname}
          />
          <input
            type="text"
            onChange={handle('lastname')}
            placeholder="lastname"
            value={values.lastname}
          />
        </div>
        <input
          type="password"
          onChange={handle('password')}
          placeholder="password"
          value={values.password}
        />
        <button
        type="submit"
        className="bg-amber-500 px-4 py-2 rounded-xl text-white font-bold"
        >
            Create Receptionist
        </button>
      </form>
    </div>
  );
};

export default ReceptionistForm;
