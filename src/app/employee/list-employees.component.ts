import { Component, OnInit } from '@angular/core';
import { EmployeeService } from './employee.service';
import { IEmployee } from './IEmployee';
import { Router } from '@angular/router';

@Component({
  selector: 'list-employee',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.css'],
  providers: []
  
})
export class ListEmployeesComponent implements OnInit {
  employees: IEmployee[];
  constructor(private employeeService: EmployeeService,
      private _router: Router) {}
  
   ngOnInit()
  {
    this.employeeService.getEmployees().subscribe(
      data => {
        //console.log(data);
        this.employees = data;
       // this.employees = Object.assign([],data);
       console.log(this.employees);
      });
  }
  editButtonClick(employeeId: number) {
    this._router.navigate(['/edit',employeeId]);
  }
  deleteButtonClick(employeeId: number) {
      this.employeeService.deleteEmployee(employeeId).subscribe(
        () => this._router.navigate(['list',this.employees]),
      (err: any) => console.log(err)
    );
    this.employeeService.getEmployees().subscribe(
      data => {
        //console.log(data);
        this.employees = data;
       // this.employees = Object.assign([],data);
       console.log(this.employees);
      });
  }
  OnSubmit() {
    
    
    }
}