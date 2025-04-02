// import Permission from './permission.model';
// import Role from './role.model';
import User from './user/user.model'; // Add other models as needed

// Ensure models are registered
/**
 * this was due to this error: MissingSchemaError: Schema hasn't been registered for model "Permission".
 * that is why i created the file
Use mongoose.model(name, schema)
 */
// export { Permission, Role, User }; // Add other models as needed
export { User };