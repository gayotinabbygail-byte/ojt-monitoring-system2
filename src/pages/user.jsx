import { useEffect, useState } from "react";

import {
  Plus,
  Search,
  UserPlus,
  X,
  Copy,
  Check,
  Users as UsersIcon,
  UserRound,
  ShieldCheck,
  Phone,
  Mail,
  Pencil,
} from "lucide-react";

import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import { useAuth } from "../../context/AuthContext";

import {
  createManagedUser,
  updateManagedUser,
} from "../../services/userManagementService";

import "../../styles/Users.css";

function Users() {
  const { user } = useAuth();

  //USER LIST
  const [users, setUsers] = useState([]);

  const [usersLoading, setUsersLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // MODAL
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [createdAccount, setCreatedAccount] = useState(null);

  const [copied, setCopied] = useState(false);
  // EDIT USER
  const [editingUser, setEditingUser] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // FORM
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "staff",
  });

  //LOAD USERS
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(usersQuery);
      const userList = snapshot.docs.map((userDoc) => ({
        id: userDoc.id,
        ...userDoc.data(),
      }));

      setUsers(userList);
    } catch (error) {
      console.error("Error loading users:", error);

      try {
        const usersRef = collection(db, "users");

        const snapshot = await getDocs(usersRef);

        const userList = snapshot.docs.map((userDoc) => ({
          id: userDoc.id,
          ...userDoc.data(),
        }));

        setUsers(userList);
      } catch (fallbackError) {
        console.error("Fallback user loading failed:", fallbackError);

        alert(fallbackError.message || "Failed to load users.");
      }
    } finally {
      setUsersLoading(false);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    loadUsers();
  }, []);

  //FILTER USERS
  const filteredUsers = users.filter((currentUser) => {
    const search = searchTerm.toLowerCase().trim();

    const fullName = `${currentUser.firstName || ""} ${
      currentUser.lastName || ""
    }`.toLowerCase();

    const email = (currentUser.email || "").toLowerCase();
    const phone = (currentUser.phone || "").toLowerCase();
    const role = (currentUser.role || "").toLowerCase();

    // SEARCH FILTER
    const matchesSearch =
      !search ||
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      role.includes(search);

    // ROLE FILTER
    const matchesRole = roleFilter === "all" || role === roleFilter;

    return matchesSearch && matchesRole;
  });

  //FORM HANDLING
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  //RESET FORM
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "staff",
    });
  };

  //OPEN MODAL
  const handleOpenModal = () => {
    resetForm();
    setCreatedAccount(null);
    setCopied(false);
    setShowModal(true);
  };

  //CLOSE MODAL
  const handleCloseModal = () => {
    if (loading || updateLoading) {
      return;
    }

    setShowModal(false);
    setCreatedAccount(null);
    setCopied(false);
    setEditingUser(null);
    resetForm();
  };

  //CREATE USER
  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (!formData.firstName.trim()) {
      alert("Please enter the first name.");
      return;
    }

    if (!formData.lastName.trim()) {
      alert("Please enter the last name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter the email.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter the phone number.");
      return;
    }

    if (!formData.role) {
      alert("Please select a role.");
      return;
    }

    try {
      setLoading(true);

      const result = await createManagedUser({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        createdBy: user?.uid,
      });

      // Show generated credentials and user information
      setCreatedAccount({
        ...result,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      });

      // Reset the input form
      resetForm();

      // Refresh user list
      await loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);

      alert(error.message || "Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  //COPY PASSWORD
  const handleCopyPassword = async () => {
    if (!createdAccount?.temporaryPassword) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdAccount.temporaryPassword);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Unable to copy password.");
    }
  };

  // OPEN EDIT MODAL
  const handleEditUser = (selectedUser) => {
    setEditingUser(selectedUser);

    setFormData({
      firstName: selectedUser.firstName || "",
      lastName: selectedUser.lastName || "",
      email: selectedUser.email || "",
      phone: selectedUser.phone || "",
      role: selectedUser.role || "staff",
    });

    setCreatedAccount(null);
    setCopied(false);
    setShowModal(true);
  };

  // UPDATE USER
  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!editingUser) {
      return;
    }

    if (!formData.firstName.trim()) {
      alert("Please enter the first name.");
      return;
    }

    if (!formData.lastName.trim()) {
      alert("Please enter the last name.");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter the email.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Please enter the phone number.");
      return;
    }

    if (!formData.role) {
      alert("Please select a role.");
      return;
    }

    try {
      setUpdateLoading(true);

      await updateManagedUser({
        uid: editingUser.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: editingUser.status || "ACTIVE",
      });

      alert("User updated successfully.");

      setEditingUser(null);
      setShowModal(false);
      resetForm();

      await loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);

      alert(error.message || "Failed to update user.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // RENDER
  return (
    <div className="users-page">
      {/*PAGE HEADER*/}

      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Manage staff and customer accounts.</p>
        </div>
      </div>

      {/* TOOLBAR*/}

      <div className="users-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="role-filter">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <button className="primary-btn" onClick={handleOpenModal}>
          <Plus size={18} />
          Create New User
        </button>
      </div>

      {/*USERS CARD*/}

      <div className="users-card">
        {usersLoading ? (
          <div className="empty-users">
            <UsersIcon size={42} />

            <h3>Loading users...</h3>

            <p>Please wait while the user list is being loaded.</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-users">
            <UserPlus size={42} />

            <h3>{searchTerm ? "No users found" : "No users to display"}</h3>

            <p>
              {searchTerm
                ? "Try changing your search."
                : "Create your first staff or customer account."}
            </p>
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Temporary Password</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((currentUser) => (
                  <tr key={currentUser.id}>
                    {/* USER */}

                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {currentUser.firstName?.charAt(0).toUpperCase() ||
                            "U"}
                        </div>

                        <div>
                          <strong>
                            {currentUser.firstName || ""}{" "}
                            {currentUser.lastName || ""}
                          </strong>

                          <span>UID: {currentUser.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td>
                      <div className="user-contact">
                        <Mail size={15} />

                        <span>{currentUser.email || "—"}</span>
                      </div>
                    </td>

                    {/* PHONE */}

                    <td>
                      <div className="user-contact">
                        <Phone size={15} />

                        <span>{currentUser.phone || "—"}</span>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td>
                      <span className={`role-badge ${currentUser.role || ""}`}>
                        {currentUser.role === "staff" ? (
                          <>
                            <ShieldCheck size={14} />
                            Staff
                          </>
                        ) : (
                          <>
                            <UserRound size={14} />
                            Customer
                          </>
                        )}
                      </span>
                    </td>

                    {/* Temporary Password */}

                    <td>
                      <span className="temp-password">
                        {currentUser.temporaryPassword || "—"}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`status-badge ${(
                          currentUser.status || "active"
                        ).toLowerCase()}`}
                      >
                        {currentUser.status || "Active"}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="user-actions">
                        <button
                          type="button"
                          className="action-btn edit"
                          title="Edit User"
                          onClick={() => handleEditUser(currentUser)}
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL*/}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="user-modal">
            {/*CREATED ACCOUNT*/}

            {createdAccount ? (
              <div className="account-created">
                <div className="success-icon">
                  <Check size={28} />
                </div>

                <h3>Account Created Successfully</h3>

                {/* CREDENTIALS */}

                <div className="credential-box">
                  <div className="credential-row">
                    <span>Name</span>

                    <strong>
                      {createdAccount.firstName} {createdAccount.lastName}
                    </strong>
                  </div>

                  <div className="credential-row">
                    <span>Email</span>

                    <strong>{createdAccount.email}</strong>
                  </div>

                  <div className="credential-row">
                    <span>Role</span>

                    <strong>{createdAccount.role}</strong>
                  </div>
                </div>

                {/* TEMPORARY PASSWORD */}

                <div className="temporary-password">
                  <span>Temporary Password</span>

                  <div className="password-display">
                    <strong>{createdAccount.temporaryPassword}</strong>

                    <button type="button" onClick={handleCopyPassword}>
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* WARNING */}

                <div className="warning-message">
                  <strong>Important:</strong>

                  <span>
                    This temporary password should be given securely to the
                    user. The user will be required to change it after their
                    first login.
                  </span>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="primary-btn full-width"
                    onClick={handleCloseModal}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/*MODAL HEADER*/}

                <div className="modal-header">
                  <div>
                    <h2>{editingUser ? "Update User" : "Create New User"}</h2>
                    <p>
                      {editingUser
                        ? "Update the user's account information."
                        : "Create a Staff or Customer account."}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="modal-close"
                    onClick={handleCloseModal}
                    disabled={loading}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* FORM*/}

                <form
                  className="user-form"
                  onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                >
                  {/* FIRST NAME */}

                  <div className="form-group">
                    <label>First Name</label>

                    <input
                      type="text"
                      name="firstName"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* LAST NAME */}

                  <div className="form-group">
                    <label>Last Name</label>

                    <input
                      type="text"
                      name="lastName"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  {!editingUser && (
                    <div className="form-group">
                      <label>Email</label>

                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  {/* PHONE */}

                  <div className="form-group">
                    <label>Phone Number</label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* ROLE */}

                  <div className="form-group">
                    <label>Account Role</label>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="staff">Staff</option>

                      <option value="customer">Customer</option>
                    </select>
                  </div>

                  {/* PASSWORD NOTICE */}

                  {!editingUser && (
                    <div className="password-notice">
                      <strong>Temporary Password</strong>

                      <p>
                        A secure temporary password will automatically be
                        generated. The user must change this password after
                        their first login.
                      </p>
                    </div>
                  )}

                  {/* ACTIONS */}

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={editingUser ? updateLoading : loading}
                    >
                      {editingUser ? (
                        <Pencil size={17} />
                      ) : (
                        <UserPlus size={17} />
                      )}
                      {editingUser
                        ? updateLoading
                          ? "Updating..."
                          : "Update User"
                        : loading
                          ? "Creating..."
                          : "Create Account"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
