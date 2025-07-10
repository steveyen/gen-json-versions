import { parseCollNameFromFieldName, splitCamelCase, splitSnakeCase } from './value-kinds';

describe('value-kinds', () => {
    describe('secondaryKeyTarget', () => {
        describe('camelCase field names', () => {
            it('should extract target from camelCase with Id suffix', () => {
                expect(parseCollNameFromFieldName('reportToEmpId')).toBe('emp');
                expect(parseCollNameFromFieldName('userManagerId')).toBe('manager');
                expect(parseCollNameFromFieldName('projectLeadId')).toBe('lead');
            });

            it('should extract target from camelCase with multiple words', () => {
                expect(parseCollNameFromFieldName('employeeDepartmentId')).toBe('department');
                expect(parseCollNameFromFieldName('customerAccountId')).toBe('account');
                expect(parseCollNameFromFieldName('productCategoryId')).toBe('category');
            });

            it('should handle camelCase with single word before Id', () => {
                expect(parseCollNameFromFieldName('empId')).toBe('emp');
                expect(parseCollNameFromFieldName('userId')).toBe('user');
                expect(parseCollNameFromFieldName('projectId')).toBe('project');
            });

            it('should return null for camelCase with only Id', () => {
                expect(parseCollNameFromFieldName('id')).toBeNull();
            });

            it('should return null for camelCase with single word', () => {
                expect(parseCollNameFromFieldName('employee')).toBeNull();
                expect(parseCollNameFromFieldName('user')).toBeNull();
            });
        });

        describe('snake_case field names', () => {
            it('should extract target from snake_case with _id suffix', () => {
                expect(parseCollNameFromFieldName('report_to_emp_id')).toBe('emp');
                expect(parseCollNameFromFieldName('user_manager_id')).toBe('manager');
                expect(parseCollNameFromFieldName('project_lead_id')).toBe('lead');
            });

            it('should extract target from snake_case with multiple words', () => {
                expect(parseCollNameFromFieldName('employee_department_id')).toBe('department');
                expect(parseCollNameFromFieldName('customer_account_id')).toBe('account');
                expect(parseCollNameFromFieldName('product_category_id')).toBe('category');
            });

            it('should handle snake_case with single word before _id', () => {
                expect(parseCollNameFromFieldName('emp_id')).toBe('emp');
                expect(parseCollNameFromFieldName('user_id')).toBe('user');
                expect(parseCollNameFromFieldName('project_id')).toBe('project');
            });

            it('should return null for snake_case with only id', () => {
                expect(parseCollNameFromFieldName('id')).toBeNull();
            });

            it('should return null for snake_case with single word', () => {
                expect(parseCollNameFromFieldName('employee')).toBeNull();
                expect(parseCollNameFromFieldName('user')).toBeNull();
            });
        });

        describe('edge cases', () => {
            it('should handle empty string', () => {
                expect(parseCollNameFromFieldName('')).toBeNull();
            });

            it('should handle single character', () => {
                expect(parseCollNameFromFieldName('a')).toBeNull();
            });

            it('should handle mixed case scenarios', () => {
                expect(parseCollNameFromFieldName('ReportToEmpId')).toBe('emp');
                expect(parseCollNameFromFieldName('REPORT_TO_EMP_ID')).toBe('EMP');
            });

            it('should handle numbers in field names', () => {
                expect(parseCollNameFromFieldName('user123Id')).toBe('user123');
                expect(parseCollNameFromFieldName('user_123_id')).toBe('123');
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