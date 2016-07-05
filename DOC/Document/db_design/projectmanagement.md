# 项目管理设计说明
projectmanagement
v0.0.1

## [employee] 员工信息表
uid varchar(45) - 账户的唯一标识，与authentication.account表关联。 主键
name varchar(45) - 员工姓名
department int - 所属部门ID
level int - 员工级别ID
officephone varchar(45) - 办公电话
mobilephone varchar(45) - 手机号
hiredate datetime - 入职时间
leavedata datetime - 离职时间

## [department] 部门配置表
id int - 关联 employee表中的 department字段
name varchar(45) - 部门名称
description varchar(45) - 部门描述
isvalid int - 有效性标识

##  [employeeLever] 员工技术级别配置表
id int - 关联 employee表中的 level字段
name varchar(45) -　员工级别

