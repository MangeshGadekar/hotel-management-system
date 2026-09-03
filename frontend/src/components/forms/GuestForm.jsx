import React, { useState } from "react";
import useManagementStore from "../../app/managmentStore";

const GuestForm = () => {
  const addGuest = useManagementStore((state) => state.addGuest);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    idProofType: "",
    idProofNumber: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await addGuest(formData);

    console.log("Guest created:", result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />

      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="idProofType"
        placeholder="ID Proof Type"
        value={formData.idProofType}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="idProofNumber"
        placeholder="ID Proof Number"
        value={formData.idProofNumber}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="state"
        placeholder="State"
        value={formData.state}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="postalCode"
        placeholder="Postal Code"
        value={formData.postalCode}
        onChange={handleChange}
        required
      />

      <button type="submit">Create Guest</button>
    </form>
  );
};

export default GuestForm;