import { secondaryKeyTarget, splitCamelCase, splitSnakeCase } from './value-kinds';

describe('value-kinds', () => {
    describe('secondaryKeyTarget', () => {
        describe('camelCase field names', () => {
            it('should extract target from camelCase with Id suffix', () => {
                expect(secondaryKeyTarget('reportToEmpId')).toBe('emp');
                expect(secondaryKeyTarget('userManagerId')).toBe('manager');
                expect(secondaryKeyTarget('projectLeadId')).toBe('lead');
            });

            it('should extract target from camelCase with multiple words', () => {
                expect(secondaryKeyTarget('employeeDepartmentId')).toBe('department');
                expect(secondaryKeyTarget('customerAccountId')).toBe('account');
                expect(secondaryKeyTarget('productCategoryId')).toBe('category');
            });

            it('should handle camelCase with single word before Id', () => {
                expect(secondaryKeyTarget('empId')).toBe('emp');
                expect(secondaryKeyTarget('userId')).toBe('user');
                expect(secondaryKeyTarget('projectId')).toBe('project');
            });

            it('should return null for camelCase with only Id', () => {
                expect(secondaryKeyTarget('id')).toBeNull();
            });

            it('should return null for camelCase with single word', () => {
                expect(secondaryKeyTarget('employee')).toBeNull();
                expect(secondaryKeyTarget('user')).toBeNull();
            });
        });

        describe('snake_case field names', () => {
            it('should extract target from snake_case with _id suffix', () => {
                expect(secondaryKeyTarget('report_to_emp_id')).toBe('emp');
                expect(secondaryKeyTarget('user_manager_id')).toBe('manager');
                expect(secondaryKeyTarget('project_lead_id')).toBe('lead');
            });

            it('should extract target from snake_case with multiple words', () => {
                expect(secondaryKeyTarget('employee_department_id')).toBe('department');
                expect(secondaryKeyTarget('customer_account_id')).toBe('account');
                expect(secondaryKeyTarget('product_category_id')).toBe('category');
            });

            it('should handle snake_case with single word before _id', () => {
                expect(secondaryKeyTarget('emp_id')).toBe('emp');
                expect(secondaryKeyTarget('user_id')).toBe('user');
                expect(secondaryKeyTarget('project_id')).toBe('project');
            });

            it('should return null for snake_case with only id', () => {
                expect(secondaryKeyTarget('id')).toBeNull();
            });

            it('should return null for snake_case with single word', () => {
                expect(secondaryKeyTarget('employee')).toBeNull();
                expect(secondaryKeyTarget('user')).toBeNull();
            });
        });

        describe('edge cases', () => {
            it('should handle empty string', () => {
                expect(secondaryKeyTarget('')).toBeNull();
            });

            it('should handle single character', () => {
                expect(secondaryKeyTarget('a')).toBeNull();
            });

            it('should handle mixed case scenarios', () => {
                expect(secondaryKeyTarget('ReportToEmpId')).toBe('emp');
                expect(secondaryKeyTarget('REPORT_TO_EMP_ID')).toBe('EMP');
            });

            it('should handle numbers in field names', () => {
                expect(secondaryKeyTarget('user123Id')).toBe('user123');
                expect(secondaryKeyTarget('user_123_id')).toBe('123');
            });
        });
    });

    describe('splitCamelCase', () => {
        it('should split camelCase strings correctly', () => {
            expect(splitCamelCase('empId')).toEqual(['emp', 'id']);
            expect(splitCamelCase('reportToEmpId')).toEqual(['report', 'to', 'emp', 'id']);
            expect(splitCamelCase('userManagerId')).toEqual(['user', 'manager', 'id']);
        });

        it('should handle single word', () => {
            expect(splitCamelCase('employee')).toEqual(['employee']);
            expect(splitCamelCase('id')).toEqual(['id']);
        });

        it('should handle empty string', () => {
            expect(splitCamelCase('')).toEqual(['']);
        });

        it('should handle acronyms', () => {
            expect(splitCamelCase('userId')).toEqual(['user', 'id']);
            expect(splitCamelCase('APIKey')).toEqual(['a', 'p', 'i', 'key']);
        });
    });

    describe('splitSnakeCase', () => {
        it('should split snake_case strings correctly', () => {
            expect(splitSnakeCase('emp_id')).toEqual(['emp', 'id']);
            expect(splitSnakeCase('report_to_emp_id')).toEqual(['report', 'to', 'emp', 'id']);
            expect(splitSnakeCase('user_manager_id')).toEqual(['user', 'manager', 'id']);
        });

        it('should handle single word', () => {
            expect(splitSnakeCase('employee')).toEqual(['employee']);
            expect(splitSnakeCase('id')).toEqual(['id']);
        });

        it('should handle empty string', () => {
            expect(splitSnakeCase('')).toEqual(['']);
        });

        it('should handle consecutive underscores', () => {
            expect(splitSnakeCase('emp__id')).toEqual(['emp', '', 'id']);
            expect(splitSnakeCase('user___manager')).toEqual(['user', '', '', 'manager']);
        });
    });
});