import TableSection from '@/components/Table/Table';

import moment from 'moment';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  FormGroup,
  TextInput,
  Dropdown,
  DatePicker,
  DatePickerInput,
  RadioButtonGroup,
  RadioButton,
  TextArea,
} from '@carbon/react';

const EditModal = ({
  isModalOpen,
  passiveModal,
  closeModal,
  modalHeading,
  modalDescription,
  onSubmit,
  formFields,
  initialData,
  index,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setFormData({});
      setErrors({});
    }
  }, [isModalOpen, initialData]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    console.log(
      'Handle Submit-Edit Modal: Form data being submitted:',
      formData
    );
    formFields.forEach((field) => {
      console.log(
        `Checking field: ${field.name}, value: ${formData[field.name]}`
      );

      if (field.name !== 'phoneNumber') {
        // Phone Number is optional
        if (!formData[field.name] && field.type !== 'textarea') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    console.log('Errors object:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log('I am the bug');
    } else {
      console.log('No errors found, submitting form:', formData);
      onSubmit(formData);
      setSuccessModalOpen(true);
      closeModal();
    }
  };

  return (
    <>
      <Modal
        open={isModalOpen}
        passiveModal={passiveModal}
        onRequestSubmit={handleSubmit}
        onRequestClose={closeModal}
        modalHeading={modalHeading}
        primaryButtonText={index === 0 ? 'Update' : 'Add'}
        secondaryButtonText="Cancel"
      >
        {formFields.headers && formFields.rows ? (
          <TableSection
            headers={formFields.headers}
            rows={formFields.rows}
            index={index}
            showButton={false}
          />
        ) : (
          <Form>
            <p className="description">{modalDescription}</p>
            {formFields.map((field) => {
              switch (field.type) {
                case 'text':
                  return (
                    <TextInput
                      className="modal__text-input"
                      key={field.name}
                      id={field.name}
                      labelText={field.label}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      invalid={!!errors[field.name]}
                      invalidText={errors[field.name]}
                    />
                  );
                case 'date':
                  return (
                    <DatePicker
                      className="modal__date-picker"
                      key={field.name}
                      datePickerType="single"
                      minDate={moment()
                        .subtract(100, 'years')
                        .format('MM/DD/YYYY')}
                      maxDate={moment().format('MM/DD/YYYY')}
                      onChange={(dates) => handleChange(field.name, dates[0])}
                    >
                      <DatePickerInput
                        id={field.name}
                        placeholder={field.placeholder}
                        labelText={field.label}
                        size="lg"
                        invalid={!!errors[field.name]}
                        invalidText={errors[field.name]}
                      />
                    </DatePicker>
                  );
                case 'radio':
                  return (
                    <RadioButtonGroup
                      className="modal__radio-group"
                      key={field.name}
                      legendText={field.label}
                      name={field.name}
                      valueSelected={
                        formData[field.name] || field.valueSelected || ''
                      }
                      invalid={!!errors[field.name]}
                      invalidText={errors[field.name]}
                      onChange={(value) => handleChange(field.name, value)}
                    >
                      {field.options.map((option) => (
                        <RadioButton
                          key={option}
                          labelText={option}
                          value={option}
                        />
                      ))}
                    </RadioButtonGroup>
                  );
                case 'dropdown':
                  return (
                    <Dropdown
                      className="modal__drop-down"
                      size="lg"
                      key={field.name}
                      id={field.name}
                      titleText={field.label}
                      helperText={field.placeholder}
                      items={field.options}
                      selectedItem={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.selectedItem)}
                      invalid={!!errors[field.name]}
                      invalidText={errors[field.name]}
                    />
                  );
                case 'textarea':
                  return (
                    <TextArea
                      className="modal__text-area"
                      key={field.name}
                      id={field.name}
                      labelText={field.label}
                      value={formData[field.name] || ''}
                      helperText={field.placeholder}
                      readOnly={true}
                    />
                  );
                default:
                  return (
                    <FormGroup key={field.name} legendText={field.label}>
                      <TextInput
                        id={field.name}
                        name={field.name}
                        labelText={field.label}
                        value={formData[field.name] || ''}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        invalid={!!errors[field.name]}
                        invalidText={errors[field.name]}
                      />
                    </FormGroup>
                  );
              }
            })}
          </Form>
        )}
      </Modal>
      <Modal
        open={successModalOpen}
        onRequestClose={() => setSuccessModalOpen(false)}
        modalHeading="Success"
        passiveModal
      >
        <p>Data has been successfully updated!</p>
      </Modal>
    </>
  );
};

export default EditModal;
