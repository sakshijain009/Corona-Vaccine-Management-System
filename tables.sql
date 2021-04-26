-------------------------------------------------------- TABLES ------------------------------------------------------------

CREATE TABLE Location
(
    pincode numeric(6) PRIMARY KEY,
    area varchar(30) NOT NULL,
    city varchar(20) NOT NULL,
    state varchar(20) NOT NULL
);

CREATE TABLE Inventory
(
    I_id int PRIMARY KEY AUTO_INCREMENT,
    I_name varchar(20) NOT NULL,
    I_contactno numeric(10),
    I_address numeric(6) NOT NULL,
    FOREIGN KEY (I_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Vaccine
(
    V_name varchar(20) PRIMARY KEY,
    V_company varchar(20) NOT NULL,
    V_cost float NOT NULL
);

CREATE TABLE Hospital
(
    H_id int AUTO_INCREMENT PRIMARY KEY,
    H_name varchar(30) NOT NULL,
    H_pwd varchar(200),
    H_contactno numeric(10),
    H_type char(1) NOT NULL CHECK (H_type='G' OR H_type='P'),
    H_address numeric(6) NOT NULL,
    H_email varchar(30),
    H_vac varchar(20),
    quant_rem int,
    FOREIGN KEY (H_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (H_vac) REFERENCES Vaccine(V_name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Supplies
(
    S_id int auto_increment primary key,
    S_hospital int,
    S_inventory int,
    S_quantity numeric,
    S_time timestamp,
    Foreign key (S_hospital) references hospital(h_id) on delete cascade on update cascade,
    Foreign key (S_inventory) references inventory(i_id) on delete cascade on update cascade
);

CREATE TABLE Person
(
    P_id int PRIMARY KEY AUTO_INCREMENT,
    P_name varchar(30) NOT NULL,
    P_Gender char(20) NOT NULL,
    P_DOB DATE NOT NULL,
    P_contactno numeric(10),
    P_address numeric(6),
    P_email varchar(30),
    FOREIGN KEY (P_address) REFERENCES Location(pincode) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Doctor
(
    D_id int PRIMARY KEY,
    D_dept varchar(20) NOT NULL,
    FOREIGN KEY (D_id) REFERENCES Person(P_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Vaccinates
(
    P int,
    Hosp int,
    Date_first DATE,
    Date_second DATE,
    PRIMARY KEY (P, Hosp),
    FOREIGN KEY (P) REFERENCES Person(P_id)  ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Hosp) REFERENCES Hospital(H_id)  ON DELETE CASCADE ON UPDATE CASCADE
);

-------------------------------------------------------- VIEWS ---------------------------------------------------------------

CREATE VIEW hosp_data AS SELECT H_id, H_name, H_contactno, H_type, H_address, H_email, H_vac FROM hospital;

CREATE VIEW vacc_data AS SELECT v.p, v.hosp, h.h_vac, h.h_type FROM vaccinates v JOIN hosp_data h ON h.h_id = v.hosp;

-------------------------------------------------------- TRIGGERS ------------------------------------------------------------

-- adds the new amount of vaccines ordered from inventory in quant_rem in hospital table.
CREATE OR REPLACE 
TRIGGER update_vacc_quant_hosp 
AFTER INSERT ON supplies 
FOR EACH ROW 
update hospital set quant_rem = quant_rem + new.s_quantity where h_id = new.s_hospital;

-- decreases quant_rem by 1 after dose is given to patient
CREATE OR REPLACE TRIGGER
update_vacc_quant_rem_hosp 
AFTER UPDATE ON vaccinates 
FOR EACH ROW 
begin 
IF old.Date_second = '0000-00-00' and old.Date_first!='0000-00-00' THEN update hospital set quant_rem = quant_rem - 1 where h_id = new.hosp;
ELSEIF old.Date_first is not null && old.Date_second is not null THEN update hospital set quant_rem = quant_rem where h_id = new.hosp;
ELSEIF new.Date_second = '0000-00-00' THEN update hospital set quant_rem = quant_rem - 1 where h_id = new.hosp; 
ELSEIF old.Date_second is null && old.Date_first is null then update vaccinates as v,hospital as h  set new.v.Date_first=old.v.Date_first,new.v.Date_second=old.v.Date_second where h.h_id = new.hosp and v.P= new.P and h.quant_rem<=1; 
ELSEIF old.Date_second is null && old.Date_first is null then update hospital set quant_rem = quant_rem - 2 where h_id = new.hosp and quant_rem>=2;  
end if; 
END;

CREATE OR REPLACE TRIGGER
delete_inventory
AFTER DELETE ON supplies 
FOR EACH ROW 
begin 
update hospital as h,supplies as s set h.quant_rem = h.quant_rem - old.s_quantity where h.h_id = old.s_hospital and h.quant_rem-old.s_quantity>=0;
END;


-------------------------------------------------------- PROCEDURES ----------------------------------------------------------

CREATE PROCEDURE filter_patients(IN dose INT, IN h_id INT) 
BEGIN 
CASE dose 
WHEN 1 THEN
select * from person p join vaccinates v on v.P = p.p_id join hosp_data h on v.hosp = h.h_id where h.h_id = h_id and v.Date_first is not NULL and v.Date_second = '0000-00-00'; 
WHEN 2 THEN 
select * from person p join vaccinates v on v.P = p.p_id join hosp_data h on v.hosp = h.h_id where h.h_id = h_id and v.Date_first != '0000-00-00' and v.Date_second != '0000-00-00'; 
WHEN 3 THEN 
select * from person p join vaccinates v on v.P = p.p_id join hosp_data h on v.hosp = h.h_id where h.h_id = h_id and v.Date_first is null and v.Date_second is null; 
WHEN 4 THEN 
select * from person p join vaccinates v on v.P = p.p_id join hosp_data h on v.hosp = h.h_id where h.h_id = h_id; 
END CASE;
END;

-------------------------------------------------------- FUNCTION ----------------------------------------------------------

CREATE FUNCTION check_priority(birthdate DATE) 
RETURNS VARCHAR(4)  
BEGIN 
DECLARE priority VARCHAR(4); 
IF year(curdate()) - year(birthdate) > 60 THEN 
SET priority = 'Yes'; 
ELSE 
SET priority = 'No'; 
END IF; 
RETURN (priority); 
END

-------------------------------------------------------- INSERTION IN TABLES -------------------------------------------------

INSERT INTO Location VALUES(110005, "Anand Parbat", "Delhi", "Delhi");
INSERT INTO Location VALUES(110001, "Baroda House", "Delhi", "Delhi");
INSERT INTO Location VALUES(400037, "Antop Hill", "Mumbai", "Maharashtra");
INSERT INTO Location VALUES(400038, "Ballard Estate", "Mumbai", "Maharashtra");
INSERT INTO Location VALUES(303609, "Harsoli Jaipur", "Jaipur", "Rajasthan");
INSERT INTO Location VALUES(395009, "Adajan", "Surat", "Gujarat");

INSERT INTO Inventory VALUES(1, "Metas Inventory", 7789234, 400038);
INSERT INTO Inventory VALUES(2, "Anandibai Inventory", 8056379, 110001);
INSERT INTO Inventory VALUES(3, "Sanjeevani Inventory", 5882310, 303609);

INSERT INTO Vaccine VALUES("Covaxin", "Bharat Biotech", 3500);
INSERT INTO Vaccine VALUES("Covishield", "AstraZeneca", 3000);

