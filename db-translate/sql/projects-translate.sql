--��ȡ��Ŀ�б�
select * from ProjectInfoConfig;

--��ȡ��Ŀ��Ա�б�
select 
  m.Account as Account, 
  m.ProjectID as ProjectID,
  m.IsTeamLeader as IsTeamLeader,
  replace(u.Name,' ','') as Name
from ProjectMemberConfig m left join UserInfo u on m.Account = u.Account;