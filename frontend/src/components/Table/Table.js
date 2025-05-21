import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Button,
} from '@carbon/react';
import { Edit as EditIcon } from '@carbon/icons-react';

const TableSection = ({ title, headers, rows, onEdit, index, showButton }) => {
  return (
    <>
      <TableContainer className="info-page__table" title={title}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableHeader key={header.key}>{header.header}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {Object.values(row).map((cell, i) => (
                  <TableCell key={i}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showButton && (
        <Button className="edit-button" onClick={onEdit} renderIcon={EditIcon}>
          {index === 0 ? `Update ${title}` : `Add ${title}`}
        </Button>
      )}
    </>
  );
};

export default TableSection;
