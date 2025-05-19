export interface EmployeeDto {
    firstName: string;
    lastName: string;
    email: string;
    phNo?: string;
    password?: string;
    employmentDetails?: any;
    status: string;
    roles?: string[];
  }

  export interface VendorDto {
    vendorBusinessDetails?: any;
    vendorComplianceInfo?: any;
    vendorCompanyInfo?: any;
    phNo?: string;
    email: string;
    password?: string;
    status: string;
    roles?: string[];
  }

  export interface UserDto {
    vendorBusinessDetails?: any;
    vendorComplianceInfo?: any;
    vendorCompanyInfo?: any;
    employmentDetails?: any;
    phNo?: string;
    email: string;
    password?: string;
    status: string;
    roles?: string[];
  }