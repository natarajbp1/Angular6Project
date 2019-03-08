import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors, FormControl, FormArray } from'@angular/forms';
import { CustomValidators } from '../shared/custom.validators';
import { ActivatedRoute } from '@angular/router';
import { PARAMETERS } from '@angular/core/src/util/decorators';
import { EmployeeService } from './employee.service';
import { ISkill } from './ISkill';
import { IEmployee } from './IEmployee';
import { Router } from '@angular/router';
// This file creates a new employee
 
@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {
  employeeForm: FormGroup;
  employee: IEmployee;
  empId: number;
  pageTitle: string;

  validationMessages = {
    'fullName': {
      'required': 'full Name is required.',
      'minlength': 'full Name must be greater than 2 characters.',
      'maxlength': 'full Name must be less than 10 characters.',
    },
    'email': {
      'required': 'Email is required',
      'emailDomain': 'Email Domain should be dell.com',
    },
    'confirmEmail': {
      'required': 'Confirm Email is required.',
    },
    'emailGroup': {
      'emailMismatch': 'Email and Confirm Email do not match',
    },
    'phone': {
      'required': 'Phone is required.'
    },
    
  };

  formErrors = {
  };

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private router: Router) { }

  ngOnInit() {
    this.employeeForm = this.fb.group({     //root form group
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(10)]],
      contactPreference: ['email'],
      emailGroup: this.fb.group({
        email: ['',[Validators.required, CustomValidators.emailDomain('dell.com')]],
        confirmEmail: ['', Validators.required],
      }, {validator: matchEmail}),
       
      phone: [''],
      skills: this.fb.array([
        this.addSkillFormGroup()
      ])
    });

    this.employeeForm.get('contactPreference').valueChanges.subscribe((data: string) => {
      this.onContactPrefernceChange(data);
    })

    this.employeeForm.valueChanges.subscribe((data) => {
      this.logValidationErrors(this.employeeForm);
    });

  this.route.paramMap.subscribe(params => {
    this.empId = +params.get('id');
    if (this.empId) {
      this.pageTitle = 'Edit Employee';
      this.getEmployee(this.empId);
    } else {
      this.pageTitle= 'Create Employee';
      this.employee = {
        id: null,
        fullName: '',
        contactPreference: '',
        email: '',
        phone: null,
        skills: []
      };
    }
  });
}
  getEmployee(id: number) {
    this.employeeService.getEmployee(id).subscribe(
      (employee: IEmployee) => {
        this.editEmployee(employee);
        this.employee = employee;
      },
      (err: any) => console.log(err)
    );
  }

  editEmployee(employee: IEmployee) {
    this.employeeForm.patchValue({
      fullName: employee.fullName,
      contactPreference: employee.contactPreference,emailGroup: {
        email: employee.email,
        confirmEmail: employee.email
      },
      phone: employee.phone
    });

    this.employeeForm.setControl('skills', this.setExistingSkills(employee.skills));
  }

  setExistingSkills(skillSets: ISkill[]): FormArray {
     const formArray = new FormArray([]);
     skillSets.forEach(s => {
      formArray.push(this.fb.group({
        skillName: s.skillName,
        experienceInYears: s.experienceInYears,
        proficiency: s.proficiency
      }));
     });
     return formArray;
  }

  addSkillButtonClick(): void {
    (<FormArray>this.employeeForm.get('skills')).push(this.addSkillFormGroup());
  }

  removeSkillButtonClick(skillGroupIndex: number): void {
   const skillsFormArray = <FormArray>this.employeeForm.get('skills');
   skillsFormArray.removeAt(skillGroupIndex);
   skillsFormArray.markAsDirty();
   skillsFormArray.markAsTouched();
  }

  addSkillFormGroup(): FormGroup {
    return this.fb.group({        
      skillName: ['',Validators.required],
      experienceInYears: ['',Validators.required],
      proficiency:['',Validators.required]
    });
  }

  onContactPrefernceChange(selectedValue: string) {
    const phoneControl = this.employeeForm.get('phone');
    if (selectedValue === 'phone') {
      phoneControl.setValidators(Validators.required);
    } else {
      phoneControl.clearValidators();
    }
    phoneControl.updateValueAndValidity();
  }
  
  logValidationErrors(group: FormGroup = this.employeeForm): void {
    Object.keys(group.controls).forEach((key: string) => {
     const AbstractControl = group.get(key);

     this.formErrors[key] = '';
        if (AbstractControl && !AbstractControl.valid &&
          (AbstractControl.touched || AbstractControl.dirty || AbstractControl.value !=='')) {
          const messages = this.validationMessages[key];
          
          for (const errorKey in AbstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }

     if(AbstractControl instanceof FormGroup) {
       this.logValidationErrors(AbstractControl);
      }
    });
  }

  onLoadDataClick(): void {

   const formArray1 = this.fb.array([
    new FormControl('John', Validators.required),
    new FormControl('IT', Validators.required),
    new FormControl('Male', Validators.required),
  ]);
  const FormGroup = this.fb.group([
    new FormControl('John', Validators.required),
    new FormControl('IT', Validators.required),
    new FormControl('Male', Validators.required),
  ]);
    
  console.log(formArray1);
  console.log(FormGroup);
  }

onSubmit() {
  this.MapFormValuesToEmployeeModel();
  if(this.employee.id) {
  this.employeeService.updateEmployee(this.employee).subscribe(
    () => this.router.navigate(['list']),
    (err: any) => console.log(err)
  );
  } else {
    this.employeeService.addEmployee(this.employee).subscribe(
      () => this.router.navigate(['list']),
      (err: any) => console.log(err)
    );
  }
  }
  onDeleteClick() {
    this.employeeService.deleteEmployee(this.employee.id).subscribe(
      () => this.router.navigate(['list']),
    (err: any) => console.log(err)
  );
  }
  MapFormValuesToEmployeeModel() {
    this.employee.fullName = this.employeeForm.value.fullName;
    this.employee.contactPreference = this.employeeForm.value.contactPreference;
    this.employee.email = this.employeeForm.value.emailGroup.email;
    this.employee.phone = this.employeeForm.value.phone;
    this.employee.skills = this.employeeForm.value.skills;
  }
}
function matchEmail(group: AbstractControl): {[key: string]: any} | null {
  const emailControl = group.get('email');
  const confirmEmailControl = group.get('confirmEmail');

  if (emailControl.value === confirmEmailControl.value 
    || (confirmEmailControl.pristine && confirmEmailControl.value ==='')) {
    return  null;
  } else {
    return { 'emailMismatch': true };
  }
}




